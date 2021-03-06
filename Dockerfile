FROM node:10-jessie

MAINTAINER datapunt@amsterdam.nl

EXPOSE 80

RUN apt-get update && apt-get install -y git nginx && rm -rf /var/lib/apt/lists/*

COPY package.json /app/

WORKDIR /app

ENV PATH=./node_modules/.bin/:~/node_modules/.bin/:$PATH
RUN git config --global url."https://".insteadOf git:// && \
    git config --global url."https://github.com/".insteadOf git@github.com: && \
    yarn install && \
    chmod -R u+x node_modules/.bin/

COPY src /app/src
COPY public /app/public
COPY default.conf /app

RUN yarn build && cp -r /app/build/. /var/www/html/

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

RUN rm -f /etc/nginx/sites-enabled/default

COPY default.conf /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
