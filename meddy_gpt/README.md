docker-compose down --volumes --remove-orphans


docker-compose up --build

docker-compose restart backend   

docker cp $(docker-compose ps -q caddy):/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt


