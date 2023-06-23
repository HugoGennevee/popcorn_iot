# Machine à popcorn

Ce projet est une solution tripartite pour la gestion d'un système de machine à popcorn avec scanner qui utilise VueJS, NodeJS et la technologie de QR Code.

**Ce projet a été réalisé dans un cadre scolaire et est destiné à des fins éducatives uniquement.**


## Fonctionnalités

- Gestion de compte et d'abonnement via un site web
- Une machine à popcorn qui peut scanner des cartes/QrCodes et fournir des popcorns

## Prérequis

- Node.js
- npm
- MySQL

## Installation

Clonez le dépôt : ```git clone https://github.com/HugoGennevee/popcorn_iot```

Pour l'api :
1. Naviguez vers le dossier de l'api :
   ```cd api```
2. Installez les dépendances :
   ```npm install```
3. Configurez l'adresse et le compte de la base de données dans le fichier ```db.js```
4. Exécutez l'api :
   ```npm start```

Pour le site web :
1. Naviguez vers le dossier du site web :
   ```cd client_popcorn```
2. Installez les dépendances :
   ```npm install```
3. Exécutez l'application en mode développement :
   ```npm run dev```
4. Visitez `http://localhost:5173` pour accéder à l'application.

Pour la simulation de la machine de popcorn :
1. Naviguez vers le dossier de la machine de popcorn :
   ```cd machine-popcorn```
2. Installez les dépendances :
   ```npm install```
3. Exécutez l'application en mode développement :
   ```npm run dev```
4. Visitez `http://localhost:5174` pour accéder à l'application.

Pour la base de données : 
1. Créer une base de données avec le nom ```popcorn```
2. un fichier ```BDD.sql``` est disponible à la racine du projet pour le schéma de la base de données

## Le fonctionnement global de la solution

La solution est composée de trois éléments principaux :

1. Un site de gestion de compte/abonnement créé avec Vue.js 3. C'est ici que les utilisateurs peuvent gérer leur compte et abonnement et générer leur QR Code.
2. Une API basée sur Node.js qui assure la liaison entre le site web, la base de données et la machine à popcorn. Elle permet d'enregistrer les données des utilisateurs, de gérer les abonnements et d'interagir avec la machine à popcorn.
3. Une machine à popcorn qui peut scanner des QR Codes. Lorsqu'un QR Code est scanné, la machine vérifie l'abonnement de l'utilisateur et fournit les popcorns correspondants.

## Technologies utilisées

- Vue.js 3
- Vue-router
- Vue Vite
- MySQL
- Bootstrap 5
- Axios
- NodeJS
- Cors
- JWT

## Structure du projet

- `/api`: Contient la solution de l'API
- `/client_popcorn`: Contient la solution du site web client
- `/machine-popcorn`: Contient la solution de la simulation de la machine de popcorn
