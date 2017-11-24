# Node.js runtime
FROM node:8-alpine

# Cache all the binary dependencies first
RUN apk add --update ffmpeg graphicsmagick exiftool

# Install thumbsup globally
ARG THUMBSUP_VERSION=2.x.x
RUN npm install -g thumbsup@${THUMBSUP_VERSION}

# Default command is thumbsup itself, so we can run
# > docker run thumbsupgallery/thumbsup --input [...] --output [...]
CMD ["thumbsup"]
