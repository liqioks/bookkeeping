# -*- coding: utf-8 -*-
"""
把「打工人小账本」页面同步到 Capacitor 工程的 www/index.html，并做 App 版适配：
  1) 去掉 WorkBuddy 平台注入脚本 /page/page_comm/inject.js（App 内没有该路径，会 404）
  2) viewport 增加 viewport-fit=cover（全面屏安全区适配）
用法：python prepare-page.py
"""
import re
from pathlib import Path

SRC = Path(r'D:\workbody_files\2026-10-10-22-49-42\打工人小账本.html')
DST = Path(r'E:\dagongrProject\www\index.html')

if not SRC.exists():
    raise SystemExit('找不到源页面：%s' % SRC)

h = SRC.read_text(encoding='utf-8')
before = len(h)

# 1) 去掉平台注入脚本
h, n1 = re.subn(r'\s*<script[^>]*src="/page/page_comm/inject\.js"[^>]*>\s*</script>', '', h)

# 2) viewport 补 viewport-fit=cover（幂等）
if 'viewport-fit=cover' not in h:
    h = h.replace(
        'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"',
        'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"'
    )

DST.parent.mkdir(parents=True, exist_ok=True)
DST.write_text(h, encoding='utf-8')

print('源页面      :', SRC)
print('输出        :', DST)
print('大小        : %d -> %d 字符' % (before, len(h)))
print('移除注入脚本:', '已移除' if n1 else '未找到（可能已处理）')
print('viewport-fit:', '已包含' if 'viewport-fit=cover' in h else '缺失')
print('外部 src 引用:', re.findall(r'<script[^>]*src="([^"]+)"', h) or '无')
