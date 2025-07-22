FROM node:20-bullseye

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg python3-pip && \
    pip3 install yt-dlp

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "app.js"]
