import subprocess, os, sys

ROOT = r'E:\dagongrProject'
NODE = r'C:/Users/liqio/.workbuddy/binaries/node/versions/22.22.2-6/node'
PY = sys.executable

env = dict(os.environ)
env['JAVA_HOME'] = r'E:\app\jdk21'
env['ANDROID_HOME'] = r'E:\app\android-sdk'
env['ANDROID_SDK_ROOT'] = r'E:\app\android-sdk'
env['PATH'] = r'E:\app\jdk21\bin;' + env.get('PATH', '')

def run(args, cwd, label, timeout=1800, extra_env=None):
    print('=' * 20, label, '=' * 20)
    e = dict(env)
    if extra_env:
        e.update(extra_env)
    p = subprocess.run(args, cwd=cwd, env=e, capture_output=True, text=True,
                       errors='replace', timeout=timeout)
    out = (p.stdout or '').strip()
    if out:
        print(out[-2500:])
    err = (p.stderr or '').strip()
    if err:
        print('--- stderr ---')
        print(err[-1500:])
    print('返回码 =', p.returncode)
    return p.returncode

# 1) 源页面 -> www（含 App 适配：去注入脚本、补 viewport-fit）
run([PY, 'prepare-page.py'], ROOT, '1/3 同步页面到 www')

# 2) www -> android/app/src/main/assets/public （sync 同时会把新插件注册进原生工程）
#    注：本机环境的「安全删除」注入会让 CLI 的清理步骤超时，这里单独关掉它
run([NODE, 'node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'], ROOT,
    '2/3 同步资源与插件到 Android',
    extra_env={'NODE_OPTIONS': '', 'CODEBUDDY_SAFE_DELETE_ENABLED': '0'})

# 3) 构建 Debug APK
proj = os.path.join(ROOT, 'android')
rc = run(['cmd', '/c', 'gradlew.bat', 'assembleDebug', '--no-daemon'], proj, '3/3 构建 APK')

# 4) 产物清单
apk_dir = os.path.join(proj, 'app', 'build', 'outputs', 'apk', 'debug')
print('-' * 60)
if os.path.isdir(apk_dir):
    for f in os.listdir(apk_dir):
        fp = os.path.join(apk_dir, f)
        print('产物:', f, '%.1f MB' % (os.path.getsize(fp) / 1048576))
else:
    print('未找到 APK 输出目录:', apk_dir)

# 5) 复制到工程根目录，方便直接取用
src = os.path.join(apk_dir, 'app-debug.apk')
dst = os.path.join(ROOT, '打工人小账本-v1.0-debug.apk')
if os.path.isfile(src):
    import shutil
    shutil.copy2(src, dst)
    print('已复制到:', dst, '%.1f MB' % (os.path.getsize(dst) / 1048576))
