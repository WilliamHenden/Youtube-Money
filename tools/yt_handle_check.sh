#!/usr/bin/env bash
# Check whether YouTube handles are free. Usage: tools/yt_handle_check.sh Handle1 Handle2 ...
# A very short page means YouTube has no channel at that handle. Only YouTube is checked.
for h in "$@"; do
  curl -s -m 12 -L -H "Accept-Language: en" "https://www.youtube.com/@$h" | python3 -c "
import sys, re
t = sys.stdin.read(); h = sys.argv[1]
if len(t) < 5000:
    print(f'@{h:<26} FREE')
else:
    s = re.search(r'([\d.,]+[KM]? subscribers?)', t)
    print(f'@{h:<26} taken  {s.group(1) if s else \"0 subscribers\"}')" "$h"
done
