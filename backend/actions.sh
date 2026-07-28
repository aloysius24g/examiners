#! /usr/bin/bash

createDevDb() {
  docker run \
    --name setters-db \
    -e 'POSTGRES_USER=dev' \
    -e 'POSTGRES_PASSWORD=password' \
    -e 'POSTGRES_DB=setters' \
    -p 5432:5432 \
    -d \
    'postgres:18' ||
    docker start setters-db
}

destroyDevDb() {
  docker stop dev-postgres
  docker rm dev-postgres
}


while true;
do
  echo '0: exit';
  echo '1: create dev db';
  echo '2: destroy dev db';
  echo;
  read action_number

  case $action_number in
    0)
      echo 'exiting ...'
      exit 1
      ;;
    1)
      createDevDb > /dev/null
      exit 0
      ;;
    2)
      destroyDevDb > /dev/null
      exit 0
      ;;
  esac
done
