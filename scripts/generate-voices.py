"""Regenerate the fixed Italian voice clips. Requires edge-tts 7.2.8 or newer.

Only fixed game copy is synthesized. Names and other profile data are never sent.
Runtime playback serves bundled MP3s, requiring no service or key on devices.
"""
import asyncio
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCAL_TOOLS = ROOT / '.superpowers' / 'tts-tools'
if LOCAL_TOOLS.exists():
    sys.path.insert(0, str(LOCAL_TOOLS))
import edge_tts

async def main():
    raw = subprocess.check_output(
        ['node', '--input-type=module', '-e',
         "import {voiceLines} from './scripts/voice-lines.mjs';process.stdout.write(JSON.stringify(voiceLines));"],
        cwd=ROOT,
    )
    lines = json.loads(raw.decode('utf-8'))
    output = ROOT / 'public' / 'audio'
    output.mkdir(parents=True, exist_ok=True)
    mapping = {}
    semaphore = asyncio.Semaphore(3)
    async def generate(i, text):
        filename = hashlib.sha256(text.encode('utf-8')).hexdigest()[:16] + '.mp3'
        target = output / filename
        async with semaphore:
            if not target.exists() or target.stat().st_size < 500:
                temporary = target.with_suffix('.mp3.part')
                for attempt in range(4):
                    try:
                        await edge_tts.Communicate(text, 'it-IT-ElsaNeural', rate='-8%', pitch='+0Hz').save(str(temporary))
                        if temporary.stat().st_size < 500:
                            raise RuntimeError(f'Empty voice clip: {filename}')
                        temporary.replace(target)
                        break
                    except Exception:
                        temporary.unlink(missing_ok=True)
                        if attempt == 3:
                            raise
                        await asyncio.sleep(2 ** (attempt + 1))
            print(f'Voice {i + 1}/{len(lines)}: {filename}', flush=True)
        return text, filename
    mapping = dict(await asyncio.gather(*(generate(i, text) for i, text in enumerate(lines))))
    (ROOT / 'src' / 'voice-map.json').write_text(json.dumps(mapping, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f'Generated {len(mapping)} clips, {sum(p.stat().st_size for p in output.glob("*.mp3"))} bytes.', flush=True)

if __name__ == '__main__':
    asyncio.run(main())
