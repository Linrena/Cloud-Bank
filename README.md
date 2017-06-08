# Open Source Cloud Native workloads on LinuxONE

Open source software has expanded from a low-cost alternative to a platform for enterprise databases, clouds and next-generation apps. These workloads need higher levels of scalability, security and availability from the underlying hardware infrastructure.

LinuxONE was built for open source so you can harness the agility of the open revolution on the industry’s most secure, scalable and high-performing Linux server. In this journey we will show how to run open source Cloud-Native workloads on LinuxONE

## Scenarios

- [Scenario One: Use Docker images from Docker hub to run your workloads on LinuxONE e.g. WordPress](#scenario-one-use-docker-images-from-docker-hub-to-run-your-workloads-on-linuxone)    
- [Scenario Two: Create your own Docker images for LinuxONE e.g. GitLab ](#scenario-two-create-your-own-docker-images-for-linuxone)
- [Scenario Three: Use Kubernetes on LinuxONE to run your cloud-naive workloads](#scenario-three-use-kubernetes-on-linuxone-to-run-your-cloud-naive-workloads)   

## Included Components

- [LinuxONE](https://www-03.ibm.com/systems/linuxone/open-source/index.html)
- [Docker](https://www.docker.com)
- [Docker Store](https://sore.docker.com)
- [WordPress](https://workpress.com)
- [MariaDB](https://mariadb.org)

## Prerequisites

Register at [LinuxONE Communinity Cloud](https://developer.ibm.com/linuxone/) for a trial account.
We will be using a Ret Hat base image for this journey, so be sure to chose the
'Request your trial' button on the left side of this page.

## Scenario One: Use Docker images from Docker hub to run your workloads on LinuxONE

[Docker Hub](https://hub.docker.com) makes it rather simple to get started with
containers, as there are quite a few images ready to for your to use.  You can
browse the list of images that are compatable with LinuxONE by doing a search
on the ['s390x'](https://hub.docker.com/search/?isAutomated=0&isOfficial=0&page=1&pullCount=0&q=s390x&starCount=0) tag.
We will start off with everyone's favorite demo: an installation of WordPress.
These instructions assume a base RHEL 7.2 image.  If you are using Ubuntu,
please follow the separate [instructions](docs/ubuntu.md)

### 1. Install docker
```text
:~$ yum install docker.io
```

### 2. Install docker-compose

Install dependencies

```text
sudo yum install -y python-setuptools
```

Install pip with easy_install

```text
sudo easy_install pip
```

Upgrade backports.ssl_match_hostname

```text
sudo pip install backports.ssl_match_hostname --upgrade
```

Finally, install docker-compose itself
```text
sudo pip install docker-compose
```

### 3. Run and install WordPress

Now that we have docker-compose installed, we will create a docker-compose.yml
file.  This will specifiy a couple of containers from the Docker Store that
have been specifically written for z systems.

```text
vim docker-compose.yml
```

```text
version: '2'

services:

  wordpress:
    image: s390x/wordpress
    ports:
      - 8080:80
    environment:
      WORDPRESS_DB_PASSWORD: example

  mysql:
    image: brunswickheads/mariadb-5.5-s390x
    environment:
      MYSQL_ROOT_PASSWORD: example
```

And finally, run docker-compose (from the same directory you created the .yml)

```text
sudo docker-compose up -d
```

After all is installed, you can check the status of your containers
```text
:~$ sudo docker-compose ps
       Name                     Command               State          Ports         
----------------------------------------------------------------------------------
ubuntu_mysql_1       /docker-entrypoint.sh mysq ...   Up      3306/tcp             
ubuntu_wordpress_1   /entrypoint.sh apache2-for ...   Up      0.0.0.0:8080->80/tcp
```
and if all is well, you can see your new blog at localhost:8080

## Scenario Two: Create your own Docker images for LinuxONE

In our previous scenario, we used a couple of container images that had already
been created and were waiting for our use in the Docker Hub Community.  But
what if you are looking to run a workload that is not currently available
there?  In this scenario, we will walk through the steps to create your own
Docker images.  It helps to start with a base OS image; in this case we will be
using Ubuntu ([s390x/ubuntu](https://hub.docker.com/r/s390x/ubuntu/)).  On top
of which, we will use very popular repository, GitLab for this example.

### 1. Setup

First, let's create a directory for our scenario:

```text
$ mkdir gitlabexercise
$ cd gitlabexercise
```

You will also need a `requirements.txt` file in the directory with the contents:

```text
gitlab
postgres
redis
```

### 2. Create Dockerfiles

Next we need to write a few Dockerfiles to build our Docker images.  In the
project directory, create the following three files with their respective
content:

Dockerfile-gitlab
```text
FROM s390x/ubuntu

# update & upgrade the ubuntu base image
RUN apt-get update && apt-get upgrade -y

# Install required packages
RUN apt-get update -q \
    && DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
      ca-certificates \
      openssh-server \
      wget \
      apt-transport-https \
      vim \
      apt-utils \
      curl \
      postfix \
      nano

# Install the gitlab 
RUN apt-get install -y gitlab

# Manage SSHD through runit
RUN mkdir -p /opt/gitlab/sv/sshd/supervise \
    && mkfifo /opt/gitlab/sv/sshd/supervise/ok \
    && printf "#!/bin/sh\nexec 2>&1\numask 077\nexec /usr/sbin/sshd -D" > /opt/gitlab/sv/sshd/run \
    && chmod a+x /opt/gitlab/sv/sshd/run \
    && ln -s /opt/gitlab/sv/sshd /opt/gitlab/service \
    && mkdir -p /var/run/sshd

# Disabling use DNS in ssh since it tends to slow connecting
RUN echo "UseDNS no" >> /etc/ssh/sshd_config

# Prepare default configuration
RUN ( \
  echo "" && \
  echo "# Docker options" && \
  echo "# Prevent Postgres from trying to allocate 25% of total memory" && \
  echo "postgresql['shared_buffers'] = '1MB'" ) >> /etc/gitlab/gitlab.rb && \
  mkdir -p /assets/ && \
  cp /etc/gitlab/gitlab.rb /assets/gitlab.rb

# Expose web & ssh
EXPOSE 443 80 22

# Define data volumes
VOLUME ["/etc/gitlab", "/var/opt/gitlab", "/var/log/gitlab"]

# Copy assets
COPY assets/wrapper /usr/local/bin/

# Wrapper to handle signal, trigger runit and reconfigure GitLab
CMD ["/usr/local/bin/wrapper"]
```

Dockerfile-postgres

```text
#
# example Dockerfile for https://docs.docker.com/examples/postgresql_service/
#

FROM s390x/ubuntu

RUN apt-get update && apt-get upgrade -y

# Add the PostgreSQL PGP key to verify their Debian packages.
# It should be the same key as https://www.postgresql.org/media/keys/ACCC4CF8.asc
RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8

# Install ``python-software-properties``, ``software-properties-common`` and PostgreSQL
#  There are some warnings (in red) that show up during the build. You can hide
#  them by prefixing each apt-get statement with DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y python-software-properties software-properties-common postgresql postgresql-client postgresql-contrib

# Note: The official Debian and Ubuntu images automatically ``apt-get clean``
# after each ``apt-get``

# Run the rest of the commands as the ``postgres`` user created by the ``postgres`` package when it was ``apt-get installed``
USER postgres

# Create a PostgreSQL role named ``docker`` with ``docker`` as the password and
# then create a database `docker` owned by the ``docker`` role.
# Note: here we use ``&&\`` to run commands one after the other - the ``\``
#       allows the RUN command to span multiple lines.
RUN    /etc/init.d/postgresql start &&\
    psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" &&\
    createdb -O docker docker

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible.
RUN echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/9.5/main/pg_hba.conf

# And add ``listen_addresses`` to ``/etc/postgresql/9.5/main/postgresql.conf``
RUN echo "listen_addresses='*'" >> /etc/postgresql/9.5/main/postgresql.conf

# Expose the PostgreSQL port
EXPOSE 5432

# Add VOLUMEs to allow backup of config, logs and databases
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

# Set the default command to run when starting the container
CMD ["/usr/lib/postgresql/9.5/bin/postgres", "-D", "/var/lib/postgresql/9.5/main", "-c", "config_file=/etc/postgresql/9.5/main/postgresql.conf"]
```

Dockerfile-redis

```text
FROM        s390x/ubuntu
RUN         apt-get update && apt-get upgrade -y && apt-get install -y redis-server
EXPOSE      6379
ENTRYPOINT  ["/usr/bin/redis-server"]
```

### 3. Define service in a Compose file

Again, we are going to use docker-compose to manage our Docker images.  In the
project directory, create a `docker-compose.yml` file that contains:

### 4. Build and run

```text
$ docker-compose up
```

## Scenario Three: Use Kubernetes on LinuxONE to run your cloud-naive workloads

Coming soon
