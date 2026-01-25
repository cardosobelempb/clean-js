## start

```ts
node - v;
```

```ts
mkdir [name-project]
cd  [name-project]
code .

npm init -y
```

## test

```ts
npm init jest@latest
```

## lint

```ts
npm install eslint -D
./node_modules/.bin/eslint --init
```

## knex

```ts
npm install knex
npm install pg

node_modules/.bin/knex migrate:latest create_users --env test
node_modules/.bin/knex migrate:latest --env test
node_modules/.bin/knex migrate:rollback --env test
```
