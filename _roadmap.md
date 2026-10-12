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

   



## Étape 2 : Configuration de l'environnement de développement (`package.json`)
Installation des outils indispensables pour le confort de développement et la gestion des scripts :
- **`cross-env`** pour définir proprement les variables d'environnement[cite: 12].
- **`nodemon`** (en dépendance de développement `-D`) pour automatiser le redémarrage du serveur Node.js à chaque modification du code[cite: 12].
- Configuration de scripts npm dédiés (`dev` et `prod`) pour basculer facilement d'un mode à l'autre[cite: 12].

## Étape 3 : Le pipeline de données (Python + SQLite)
Séparation claire des rôles entre l'ETL et le serveur web :
1. **`main.py` (ETL) :** Interroge l'API officielle de `data.gouv.nc` (en version v2.1)[cite: 8], récupère les enregistrements, compare avec la base SQLite (`offres_emploi.db`) grâce aux identifiants uniques (`uuid`), insère uniquement les nouveautés, et retourne le nombre exact de nouveaux éléments ajoutés.
2. **Express (`server.mjs`) :** Expose les routes de l'API (`/api/it-jobs`, `/api/refresh`) et sert l'interface web statique.










# Titre 1
## Titre 2
### Titre 3
#### Titre 4
##### Titre 5

* Liste à puces non ordonnées
    * Puce 2.1
    * Puce 2.2

Liste à puces numérotées
1. Premier élément 
2. Second
3. Troisième

*En italique*

**En gras**


Ligne séparation horizontale c'est --- ou ***
---	
***




```js
typeof 42
typeof 42.15        //renvoient tous les deux "number"
```