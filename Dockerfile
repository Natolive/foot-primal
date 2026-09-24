FROM node:alpine AS dev
WORKDIR /repo
COPY . .
RUN npm ci

# ponytail: la prod garde les devDependencies (drizzle-kit sert aux migrations au démarrage), alléger l'image si la taille gêne.
FROM dev AS prod
RUN npm run build -w backend && npm run build -w frontend
