# Deploy to AWS EC2

## 1. AWS EC2

EC2 > Instance > Security > Security Groups > Edit in bound rules > Add port 80

## 2. SSH Connection

```bash
chmod 400 meow-care.pem
ssh -i meow-care.pem ubuntu@3.107.91.197
```

## 3. Install Docker Engine on Ubuntu

<https://docs.docker.com/engine/install/ubuntu/>

Add Docker's official GPG key

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Add the repository to Apt sources

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
```

Instal Docker packages

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify the installation

```bash
sudo docker run hello-world
```

## 4. Copy the code

```bash
sudo apt-get update
sudo apt install git
git clone https://github.com/vinguyenthaotrinh/meow-care.git
```

or (only necessary file)

```bash
exit
ssh -i meow-care.pem ubuntu@3.107.91.197 "mkdir -p ~/deploy"
scp -i meow-care.pem compose.yml ubuntu@3.107.91.197:~/deploy

ssh -i meow-care.pem ubuntu@3.107.91.197 "mkdir -p ~/deploy/nginx"
scp -i meow-care.pem nginx/default.conf ubuntu@3.107.91.197:~/deploy/nginx/

scp -i meow-care.pem .env ubuntu@3.107.91.197:~/deploy
```

## 5. Run Docker compose

```bash
cd ~/deploy

sudo usermod -aG docker ubuntu
exit

docker compose pull
docker compose up -d
```
