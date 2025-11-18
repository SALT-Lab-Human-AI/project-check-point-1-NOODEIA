import sys
import os
from google import genai

def transcribe_audio_file(audio_file_path):
    """Transcribe audio file using Google Gemini API"""
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY environment variable is not set", file=sys.stderr)
        sys.exit(1)

    try:
        client = genai.Client(api_key=gemini_api_key)

        # Upload the audio file
        myfile = client.files.upload(file=audio_file_path)

        # Generate transcription
        prompt = 'Generate a transcript of the speech.'
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, myfile]
        )

        text = response.text.strip()
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

