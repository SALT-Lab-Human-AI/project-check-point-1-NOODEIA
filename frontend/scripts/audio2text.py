import sys
import os
from google import genai
from google.genai import types, errors

# Use an audio-capable model (2.0 Flash Lite is text-only and rejects audio).
# The v1 Gemini API supports the 1.5 audio-capable models; v1beta often returns 404.
DEFAULT_TRANSCRIBE_MODEL = os.getenv("GEMINI_TRANSCRIBE_MODEL", "gemini-1.5-flash-latest")
DEFAULT_API_VERSION = os.getenv("GEMINI_API_VERSION", "v1")

def transcribe_audio_file(audio_file_path):
    """Transcribe audio file using Gemini API with inline data"""
    print(f"#####Transcribing audio file: {audio_file_path}", file=sys.stderr)

    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY environment variable is not set", file=sys.stderr)
        sys.exit(1)
    api_version = DEFAULT_API_VERSION

    # Construct client, forcing v1 if a beta version is set (audio models are v1-only).
    if api_version.startswith("v1beta"):
        print(f"API version {api_version} does not expose audio models; overriding to v1", file=sys.stderr)
        api_version = "v1"

    def build_client(version):
        print(f"Using Gemini model '{DEFAULT_TRANSCRIBE_MODEL}' with api_version '{version}'", file=sys.stderr)
        return genai.Client(
            api_key=gemini_api_key,
            http_options=types.HttpOptions(api_version=version)
        )

    gemini_client = build_client(api_version)
    
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
        try:
            response = gemini_client.models.generate_content(
                model=DEFAULT_TRANSCRIBE_MODEL,
                contents=[
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": audio_data}}
                ],
                config={"response_mime_type": "text/plain"}
            )
        except errors.ClientError as ce:
            # If a beta API version slipped through in the hosting env, retry once with v1.
            msg = str(ce)
            if "v1beta" in msg:
                print("Retrying transcription with api_version 'v1' after v1beta rejection", file=sys.stderr)
                gemini_client = build_client("v1")
                response = gemini_client.models.generate_content(
                    model=DEFAULT_TRANSCRIBE_MODEL,
                    contents=[
                        {"text": prompt},
                        {"inline_data": {"mime_type": mime_type, "data": audio_data}}
                    ],
                    config={"response_mime_type": "text/plain"}
                )
            else:
                raise
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
