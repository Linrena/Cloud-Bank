
## Problems with our container
**Note** A docker container should usually be as minimal as possible and only run your app. If it's possible to remove the build process from you container, it's recommended to do so.

Again, since this should be as minimal as possible, it's usually recommended to to build your image based on the smallest image.

If we check the image sizes,
```bash
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
<none>               <none>              538b04e41b8b        6 hours ago         651.3 MB
meandocker_angular   latest              1a5683693b35        6 hours ago         988.8 MB
<none>               <none>              f6acbd3461ab        2 days ago          50.77 MB
<none>               <none>              876420ac0334        3 days ago          79.24 MB
angular-client       dev                 542328c3f07d        4 days ago          1.273 GB
node                 6-alpine            4c013cd428c0        11 days ago         50.77 MB
node                 6                   130ebee906ca        13 days ago         651.3 MB
```

You can see the last two images I have are node images, one is just `node:6` which is 651MBs while the other is `node:6-alpine`, which is just 50.77MB.

The difference here is that `node:6` is based on debian, while the other one is based on `Alpine` linux, and only has node, which is what we require to run our app.

To add these recommendations to our angular client docker image, we'll edit the docker file.

First of all, let's make sure the angular app can be built within our host. Build it with
```bash
$ ng build
```
This should create a `build` directory inside our angular-client directory, with the built angular app, based on the originally scafolded app. Create a new file called `Dockerfile-alternate` to show this new minimal image build process.

Edit the Dockerfile to look this way.
```text
# Build image from a lighter version of Node
FROM node:6-alpine

# Create a working directory
RUN mkdir -p /usr/src/app

# Install a simple node server
RUN npm install -g httpster

# Copy application files
COPY dist /usr/src/app

# Expose server default port
EXPOSE 3333

# Run the app
CMD ["httpster", "dist"]
```

We can now delete the previous image and container with build and run the container with
```bash
$ docker rm angular-client
$ docker rmi angular-client:dev
```

Then build the newer image and container with
```bash
$ docker build -t angular-client:dev .
$ docker run -d --name angular-client -p 3333:3333 angular-client:dev
```

Going to `localhost:3333` in your browser should be running the app. 
