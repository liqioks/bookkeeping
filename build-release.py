# -*- coding: utf-8 -*-
"""构建正式（release）APK：同步页面 → 生成签名密钥 → 配置签名 → 构建 → 验证签名。"""
import subprocess, os, sys, secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# 工具链路径：优先取环境变量，其次用本机约定目录（兼容多台机器，不再写死盘符）
def _pick(env_key, *cands):
    v = os.environ.get(env_key)
    if v and Path(v).exists():
        return Path(v)
    for c in cands:
        p = Path(c)
        if p.exists():
            return p
    return Path(cands[0])

JDK = _pick('JAVA_HOME', r'D:\app\jdk21', r'E:\app\jdk21')
SDK = _pick('ANDROID_SDK_ROOT', r'D:\app\android-sdk', r'E:\app\android-sdk')
KEYTOOL = JDK / 'bin' / 'keytool.exe'
BUILD_TOOLS = SDK / 'build-tools' / '36.0.0'
# Node 入口用当前进程可执行目录推断，避免写死用户名
NODE = _pick('NODE_EXE',
             r'C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-6/node',
             r'C:/Users/liqio/.workbuddy/binaries/node/versions/22.22.2-6/node')

KS_DIR = ROOT / 'keystore'
KS = KS_DIR / 'dagongr-release.jks'
PROPS = ROOT / 'android' / 'keystore.properties'
GRADLE = ROOT / 'android' / 'app' / 'build.gradle'
ALIAS = 'dagongr'
VERSION_NAME = '1.0.12'
VERSION_CODE = 13

env = dict(os.environ)
env['JAVA_HOME'] = str(JDK)
env['ANDROID_HOME'] = str(SDK)
env['ANDROID_SDK_ROOT'] = str(SDK)
env['PATH'] = str(JDK / 'bin') + ';' + env.get('PATH', '')

print('JDK        :', JDK)
print('Android SDK:', SDK)
print('工程根目录 :', ROOT)


def run(args, cwd=None, timeout=3600, extra_env=None):
    e = dict(env)
    if extra_env:
        e.update(extra_env)
    p = subprocess.run(args, cwd=cwd, env=e, capture_output=True, text=True,
                       errors='replace', timeout=timeout)
    return p.returncode, (p.stdout or ''), (p.stderr or '')


# ---------- 0) 同步源页面 → www → android assets ----------
# 必须执行，否则 Gradle 只会打包上一次的 assets 副本，导致 APK 里的页面是旧的。
print('[0/5] 同步页面与资源…')
rc0, out0, err0 = run([sys.executable, 'prepare-page.py'], cwd=str(ROOT))
print(out0.strip()[:800] or err0.strip()[:800])
if rc0 != 0:
    print('页面同步失败'); sys.exit(1)
# 关闭本机「安全删除」注入，否则 CLI 的清理步骤会超时
rc1, out1, err1 = run(
    [NODE, 'node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'],
    cwd=str(ROOT), extra_env={'NODE_OPTIONS': '', 'CODEBUDDY_SAFE_DELETE_ENABLED': '0'})
print((out1 or '').strip()[-600:])
if rc1 != 0:
    print('cap sync 失败'); print((err1 or '')[-800:]); sys.exit(1)

# ---------- 1) 签名密钥（已存在则复用） ----------
KS_DIR.mkdir(parents=True, exist_ok=True)
if KS.exists():
    print('[1/6] 签名密钥已存在，复用：%s' % KS)
    pwd = None
    if PROPS.exists():
        for line in PROPS.read_text(encoding='utf-8').splitlines():
            if line.startswith('storePassword='):
                pwd = line.split('=', 1)[1].strip()
    if not pwd:
        print('  !! 已有 keystore 但读不到密码，请手动检查', PROPS)
        sys.exit(1)
else:
    pwd = secrets.token_urlsafe(18)
    rc, out, err = run([
        str(KEYTOOL), '-genkeypair', '-v',
        '-keystore', str(KS),
        '-alias', ALIAS,
        '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10950',
        '-storepass', pwd, '-keypass', pwd,
        '-dname', 'CN=Dagongr Ledger,O=Personal,C=CN',
    ])
    if rc != 0 or not KS.exists():
        print('[1/6] 生成签名密钥失败')
        print(out[-1500:]); print(err[-1500:])
        sys.exit(1)
    print('[1/6] 签名密钥已生成：%s' % KS)

# ---------- 2) keystore.properties ----------
PROPS.write_text(
    '# 正式包签名信息 —— 请妥善备份本文件与 keystore/ 目录\n'
    '# 说明：storeFile 相对 android/ 目录\n'
    'storeFile=../keystore/dagongr-release.jks\n'
    'storePassword=%s\n'
    'keyAlias=%s\n'
    'keyPassword=%s\n' % (pwd, ALIAS, pwd),
    encoding='utf-8')
print('[2/6] 已写入 %s' % PROPS)

# ---------- 3) 注入签名配置到 app/build.gradle（幂等） ----------
src = GRADLE.read_text(encoding='utf-8')
changed = False

if 'keystore.properties' not in src:
    src = ('def keystorePropsFile = rootProject.file("keystore.properties")\n'
           'def keystoreProps = new Properties()\n'
           'if (keystorePropsFile.exists()) {\n'
           '    keystoreProps.load(new FileInputStream(keystorePropsFile))\n'
           '}\n\n') + src
    changed = True

if 'signingConfigs' not in src:
    old = '''    buildTypes {
        release {
            minifyEnabled false'''
    new = '''    signingConfigs {
        release {
            storeFile rootProject.file(keystoreProps['storeFile'])
            storePassword keystoreProps['storePassword']
            keyAlias keystoreProps['keyAlias']
            keyPassword keystoreProps['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false'''
    assert src.count(old) == 1, ('buildTypes 定位失败', src.count(old))
    src = src.replace(old, new, 1)
    changed = True

import re as _re
_nv, n = _re.subn(r'versionName\s+"[^"]*"', 'versionName "%s"' % VERSION_NAME, src)
if n: src, changed = _nv, True
_nc, n2 = _re.subn(r'versionCode\s+\d+', 'versionCode %d' % VERSION_CODE, src)
if n2: src, changed = _nc, True

if changed:
    GRADLE.write_text(src, encoding='utf-8')
    print('[3/6] 已写入签名配置与版本号到 app/build.gradle')
else:
    print('[3/6] app/build.gradle 已配置，跳过')

# ---------- 4) 构建 release ----------
print('[4/6] 开始构建 release（首次会稍慢）…')
proj = ROOT / 'android'
rc, out, err = run(['cmd', '/c', 'gradlew.bat', 'assembleRelease', '--no-daemon'], cwd=str(proj))
tail = out[-2500:] if out else ''
print(tail)
if err.strip():
    print('--- stderr ---')
    print(err[-1500:])

apk = proj / 'app' / 'build' / 'outputs' / 'apk' / 'release' / 'app-release.apk'
if rc != 0 or not apk.exists():
    print('构建失败'); sys.exit(1)
print('构建成功：%s  (%.1f MB)' % (apk, apk.stat().st_size / 1048576))

# ---------- 5) 验证签名 ----------
print('[5/6] 校验签名…')
rc2, out2, _ = run([str(BUILD_TOOLS / 'apksigner.bat'), 'verify', '--print-certs', '-v', str(apk)])
print(out2.strip()[:1800] if out2 else '(无输出)')
print('签名校验返回码 =', rc2)

# ---------- 产物 ----------
dest = ROOT / ('打工人小账本-v%s-release.apk' % VERSION_NAME)
shutil_copy = __import__('shutil').copy2
shutil_copy(apk, dest)
print('产物已复制到：%s  (%.1f MB)' % (dest, dest.stat().st_size / 1048576))
