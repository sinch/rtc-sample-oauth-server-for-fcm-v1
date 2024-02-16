# syntax=docker/dockerfile:1

ARG NODE_VERSION=21

FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production


WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 1000

# Run the application.
CMD npm start
