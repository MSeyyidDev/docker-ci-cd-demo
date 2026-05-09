.PHONY: install dev build start test lint format docker-build docker-run docker-up docker-down

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

test:
	npm test

lint:
	npm run lint

format:
	npm run format

docker-build:
	docker build -t docker-ci-cd-demo:local .

docker-run:
	docker run --rm -p 3000:3000 docker-ci-cd-demo:local

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
