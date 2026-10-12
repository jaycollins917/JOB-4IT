# Feuille de Route du projet ScrapWork

## Étape 1 : Init projet, structure dossiers, configuration environnement

>Mise en place de l'architecture propre du projet 

- Création du dossier racine du projet : `ScrapWork-app`
- Création d'un sous-dossier `public/` pour les fichiers servis au client (HTML, CSS, JS frontend).
- GIT
  - Initialisation du dépôt Git dans le shell à la racine du projet `git init`
  - Créer un fichier .gitignore. On y renseignera plus tard les fichiers ou dossiers à ne pas déposer sur github.
  - À cette étape le fichier .gitignore est marqué `U`. Cela signifie qu'il est untracked, ses versions ne sont pas suivies.

>Node.js
  - Initialisation du fichier de configuration `package.json` via la commande `npm init`
    - Dans la liste des question, veiller à mettre à `entry point` le fichier `server.mjs`. C'est pour npm et node.js, pour qu'ils puissent générer nativement les points d'E/S
    - Le fichier package.json est crée.
  - Le fichier package.json est le chef d'orchestre du projet. Il permet de :
    - Garder en mémoire les métadonnées du projet (auteur, versions, point d'entrée, etc...)
    - Gérer les dépendances, i.e le catalogue des bibliothèques externes dont le projet a besoin (express, sqlite, etc...). Grâce à cela, sur un autre pc, `npm install` va tout installer d'un coup.
    - Définir les raccourcis de script, comme `dev` avec `nodemon` et `cross-env`, afin de tout pouvoir compiler d'un coup.

>NPM - Node packet manager
  - Gestionnaire officiel des paquets de Node.js. C'est un:
    - Gestionnaire de bibliothèques (le catalogue) : outil qui permet de télécharger, d'installer et de mettre à jour des modules externes créés par d'autres développeurs (comme express, sqlite3 ou cors) directement depuis le terminal avec des commandes comme npm install.
    - Gestionnaire de tâches et de scripts : Il s'appuie sur le fichier package.json pour exécuter des commandes centralisées et automatisées (par exemple, lancer le serveur en mode développement avec la commande `npm run dev`).

>Installation des dépendances
  - `npm install express sqlite3 cors`
    - Installe les modules express, sqlite3 et cors.
    - *`express`* est un framework (une surcouche construite au-dessus de Node.js et de son module http) qui simplifie la vie. C'est lui qui devient le serveur web de production en gérant proprement la "plomberie" : les routes (app.get, app.post), les middlewares, les paramètres d'URL, et les réponses au format JSON ou HTML.
    - *`sqlite3`* la base de données
    - *`cors`* middleware qui signifie Cross-Origin Resource Sharing (Partage des ressources entre origines multiples).
-   `npm install --save-dev nodemon cross-env`
    -   *`nodemon`* sert à redémarrer automatiquement le serveur en cas de modifications
    -   *`cross-env`* est un outil qui permet de définir des variables d'environnement (comme NODE_ENV=development) de manière compatible sur tous les systèmes d'exploitation (Windows, macOS, Linux).    

>Configurer les scripts dans package.json

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=development nodemon server.mjs",
    "prod": "cross-env NODE_ENV=production node server.mjs"
  }
```

-   `dev` lance le serveur avec nodemon et active le mode développement (le serveur redémarrera tout seul à chaque modification).
-   `prod` lance le serveur en mode production avec Node.js standard. 

>Validation de cette étape avec Git et envoi sur Github

- Inutile d'envoyer `node_modules/` sur Github. On ajoute ce dossier dans `.gitignore`
- ⭐ `git add .`
- 🐦‍🔥`git commit -m "Étape 1 - Init projet, structure, bibliothèques"` 🐦‍🔥 
- Sur gitHub, créer un nouveau dépôt
- Dans le shell, lier le projet avec le dépôt sur Github ⏭ `git remote add origin https://github.com/jaycollins917/scrapwork-app.git` 
- Pousser le dépôt sur Github : `git push -u origin master`
- Note: la branche principale s'appelle *master*. C'est le nom historique depuis la création de Github. À présent, on utilise *main*, par convention.

   

## Étape 2 : Récupérer les offres d'emploi sur le site data.gouv.nc

### 2.1 - Le site data.gouv.nc

> Onglet information

Le site source est celui-ci :
https://data.gouv.nc/explore/dataset/offres-d-emploi-deposees-sur-le-site-emploi-nc/information/

* C'est la porte d'entrée du jeu de données. Il met à disposition des jeux de données, que l'on pourra interroger avec l'API qu'ils fournissent.
* L'identifiant du jeu de données est :  *offres-d-emploi-deposees-sur-le-site-emploi-nc*
* La licence *Licence Ouverte 2.0* indique que je peux les télécharger, les utiliser à des fin commerciales ou non, mais que je dois citer la source (gouvernement NC)
* La péridicité est quotidienne
* Date de création : 26 mars 2026

> Onglet API

Le site :
https://data.gouv.nc/explore/dataset/offres-d-emploi-deposees-sur-le-site-emploi-nc/api/

* Il explique comment utiliser l'api
* Il y a 1 127 enregistrements actifs
* La dernière version de l'api est la V2.1
 
L'endpoint, ie l'adresse exacte de l'API fournie par le site est :
https://data.gouv.nc/api/explore/v2.1/catalog/datasets/offres-d-emploi-deposees-sur-le-site-emploi-nc/records


### 2.2 - Récupérer la totalité des offres 

```py
import requests     # Bibliothèque pour permettre à python de communiquer avec le web.

# URL de l'API offres d'emploi en Nouvelle-Calédonie
URL_API = "https://data.gouv.nc/api/explore/v2.1/catalog/datasets/offres-d-emploi-deposees-sur-le-site-emploi-nc/records"
```

Voici ce qu'il faut récupérer. C'est comme un dictionnaire dans Python, avec une paire clé-valeur
Il y a donc deux clés: `total_count` et `result`
La clé `result` commence par un crochet, ie une liste. Cette liste contient des objets `{...}`, qui sont eux-mêmes un ensemble de paires clé-valeur, l'offre d'emploi.

```json
{
  "total_count":1141,
  "results":[
    {
    "uuid":"20261012d89e",
    "titre":"Pharmacien / Pharmacienne en officine",
    "nb_postes":2,
    "statut":"ACTIVE",
    "rome_code":"J1202",
    "date_debut":"2026-11-01T13:00:00+00:00",
    "ville":"OUEGOA",
    "type_contrat":"CDD",
    "nb_jours_contrat":0,
    "nb_mois_contrat":0,
    "nb_annees_contrat":0
    }]
}
```

