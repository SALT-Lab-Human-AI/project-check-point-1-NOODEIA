import sys
from gtts import gTTS
import os

def synthesize_speech(text, out_path):
    tts = gTTS(text=text, lang='en', slow=False)
    tts.save(out_path)

if __name__ == "__main__":
    # Usage: python text2audio.py "your text here" output.mp3
    if len(sys.argv) < 3:
        print("Usage: python text2audio.py 'text' output.mp3", file=sys.stderr)
        sys.exit(1)
    text = sys.argv[1]
    out_path = sys.argv[2]
    synthesize_speech(text, out_path)
    print(out_path)
