import sys
import os
from google import genai

# Use an audio-capable model (2.0 Flash Lite is text-only and rejects audio)
DEFAULT_TRANSCRIBE_MODEL = os.getenv("GEMINI_TRANSCRIBE_MODEL", "gemini-1.5-flash")

def transcribe_audio_file(audio_file_path):
    """Transcribe audio file using Gemini API with inline data"""
    print(f"#####Transcribing audio file: {audio_file_path}", file=sys.stderr)

    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY environment variable is not set", file=sys.stderr)
        sys.exit(1)
    
    gemini_client = genai.Client(api_key=gemini_api_key)
    
    try:
        # Determine mime type from file extension
        file_ext = os.path.splitext(audio_file_path)[1].lower()
        mime_type_map = {
            '.webm': 'audio/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.flac': 'audio/flac'
        }
        mime_type = mime_type_map.get(file_ext, 'audio/webm')  # default to webm
        
        # Read audio file as bytes
        with open(audio_file_path, 'rb') as audio_file:
            audio_data = audio_file.read()
        
        # Create the prompt for transcription
        prompt = 'Generate a transcript of the speech. Return only the transcribed text without any additional commentary.'
        
        # Request transcription using Gemini with inline data
        response = gemini_client.models.generate_content(
            model=DEFAULT_TRANSCRIBE_MODEL,
            contents=[
                {"text": prompt},
                {"inline_data": {"mime_type": mime_type, "data": audio_data}}
            ],
            config={"response_mime_type": "text/plain"}
        )
        text = response.text.strip()
        return text
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Usage: python audio2text.py input_audio_file
    print("Script started", file=sys.stderr)
    print(f"Arguments: {sys.argv}", file=sys.stderr)
    
    if len(sys.argv) < 2:
        print("Usage: python audio2text.py input_audio_file", file=sys.stderr)
        sys.exit(1)
    
    audio_file_path = sys.argv[1]
    print(f"Checking file: {audio_file_path}", file=sys.stderr)
    
    if not os.path.exists(audio_file_path):
        print(f"Error: Audio file not found: {audio_file_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Transcribing audio file: {audio_file_path}", file=sys.stderr)
    transcribed_text = transcribe_audio_file(audio_file_path)
    print(transcribed_text)
