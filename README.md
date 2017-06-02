# Open Source Cloud-Native workloads on Linux One

Open source software has expanded from a low-cost alternative to a platform for enterprise databases, clouds and next-generation apps. These workloads need higher levels of scalability, security and availability from the underlying hardware infrastructure.

LinuxONE was built for open source so you can harness the agility of the open revolution on the industry’s most secure, scalable and high-performing Linux server. In this journey we will show how to run open source Cloud-Native workloads on Linux One

## Scenarios

[Scenario One: Use Docker images availabe in the Docker hub and docker-compose to run your workloads e.g. WordPress](#wordpress-and-mariadb)    
[Scenario Two: Create your own Docker images for LinuxOne e.e GitLab ]()    
[Scenario Three: Use Kubernetes on LinuxOne to run your cloud-naive workloads]()   

## Included Components

- [linuxONE]
- [Docker](https://www.docker.com)
- [Docker Store](https://sore.docker.com)
- [WordPress](https://workpress.com)
- [MariaDB](https://mariadb.org)

## Prerequisites

Register at [LinuxONE Communinity Cloud](https://developer.ibm.com/linuxone/registration-ubuntu/) for a trial account.

## Scenario One: WordPress and MariaDB

We will start off with everyone's favorite demo: an installation of WordPress.

### 1. Install docker
```text
:~$ apt install docker.io
```

### 2. Install docker-compose

Install dependencies

```text
sudo apt-get update
sudo apt-get install -y python-pip
pip install --upgrade
```

Then docker-compose itself
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
