# Node.js + build depdencies + runtime dependencies
FROM thumbsupgallery/build:alpine

# Install and cache dependencies
COPY package.json /app
RUN npm install

# Run the tests
COPY . /app
RUN scripts/cibuild
