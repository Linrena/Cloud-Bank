# open-source-on-linux-one

## WordPress and MariaDB

We will start off with everyone's favorite demo: an installation of WordPress.

## Steps

1. Install docker
```text
:~$ apt install docker.io
```

2. Install docker-compose

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

3. Run and install WordPress

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
