import sys
import os
from groq import Groq

def transcribe_audio_file(audio_file_path):
    """Transcribe audio file using Groq Whisper API"""
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        print("Error: GROQ_API_KEY environment variable is not set", file=sys.stderr)
        sys.exit(1)
    
    groq_client = Groq(api_key=groq_api_key)
    
    try:
        with open(audio_file_path, "rb") as audio_file_obj:
            response = groq_client.audio.transcriptions.create(
                file=audio_file_obj,
                model="whisper-large-v3",
                response_format="text"
            )
        text = response.strip()
        return text
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Usage: python audio2text.py input_audio_file
    if len(sys.argv) < 2:
        print("Usage: python audio2text.py input_audio_file", file=sys.stderr)
        sys.exit(1)
    
    audio_file_path = sys.argv[1]
    if not os.path.exists(audio_file_path):
        print(f"Error: Audio file not found: {audio_file_path}", file=sys.stderr)
        sys.exit(1)
    
    transcribed_text = transcribe_audio_file(audio_file_path)
    print(transcribed_text)

