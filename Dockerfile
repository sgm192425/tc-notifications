# Builds production version of Community App inside Docker container,
# and runs it against the specified Topcoder backend (development or
# production) when container is executed.

FROM node:8.2.1
LABEL app="tc notify" version="1.0"

WORKDIR /opt/app
COPY . .
ARG validIssuers
ARG PORT
ENV validIssuers=$validIssuers
ENV PORT=$PORT
ENV NODE_ENV=$ENV


RUN npm install
# dotenv is required for retriving postgres env
RUN npm install dotenv --save
#RUN cat .env
RUN env
RUN npm test


CMD ["npm", "start"]
