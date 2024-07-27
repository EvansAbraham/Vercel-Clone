# Use Ubuntu as the base image
FROM ubuntu:24.10

# Install curl, git, and Node.js
RUN apt-get update && \
    apt-get install -y curl git && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /home/app

# Copy application files
COPY main.sh main.sh
COPY script.js script.js
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Make the main.sh script executable
RUN chmod +x main.sh

# Set the default command to run the script
ENTRYPOINT ["/home/app/main.sh"]
