sudo docker build -t dopot_node .
sudo docker stop dopot_node
sudo docker rm dopot_node
sudo docker run -p 4000:4000 -p 5001:5001 -d --restart unless-stopped --name dopot_node dopot_node
