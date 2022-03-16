git pull
rm ./dist/v1.0b/* -rf
cp ./src/html/* ./dist/v1.0b/ -r
sudo docker image build -t ultima .
sudo docker-compose down
sudo docker-compose up -d
