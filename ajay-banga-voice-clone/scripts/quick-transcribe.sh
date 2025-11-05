#!/bin/bash

# Quick Video Transcription Helper
# Usage: ./scripts/quick-transcribe.sh "YOUTUBE_URL" "optional-filename"

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  QUICK VIDEO TRANSCRIPTION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp not found!"
    echo "Install it with: brew install yt-dlp"
    echo ""
    exit 1
fi

# Check if URL provided
if [ -z "$1" ]; then
    echo "❌ No URL provided!"
    echo ""
    echo "Usage:"
    echo "  ./scripts/quick-transcribe.sh \"YOUTUBE_URL\" \"optional-filename\""
    echo ""
    echo "Example:"
    echo "  ./scripts/quick-transcribe.sh \"https://youtube.com/watch?v=abc123\" \"annual-meetings-2024\""
    echo ""
    exit 1
fi

URL=$1
FILENAME=${2:-"ajay-banga-$(date +%Y%m%d-%H%M%S)"}

echo "📹 Video URL: $URL"
echo "📝 Filename: $FILENAME"
echo ""

# Create directories
mkdir -p data/audio
mkdir -p data/transcripts

# Download audio
echo "⬇️  Downloading audio..."
yt-dlp -x --audio-format mp3 \
    -o "data/audio/${FILENAME}.%(ext)s" \
    "$URL"

echo ""
echo "✅ Audio downloaded!"
echo ""

# Transcribe
echo "🎤 Transcribing with OpenAI Whisper..."
npm run transcribe

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Files created:"
echo "  📂 data/audio/${FILENAME}.mp3"
echo "  📂 data/transcripts/${FILENAME}.txt"
echo ""
echo "Next steps:"
echo "  1. npm run db:stats - Check database"
echo "  2. http://localhost:3001/rj-faq - Browse content"
echo ""







