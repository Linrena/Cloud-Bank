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

### 1. Install docker
```text
:~$ apt install docker.io
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

## Scenario Three: Use Kubernetes on LinuxONE to run your cloud-naive workloads

Coming soon
