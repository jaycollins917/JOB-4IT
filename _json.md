# Comprendre le format JSON (JavaScript Object Notation)

Le format **JSON** est un format textuel léger et standardisé pour stocker et échanger des données structurées. Il est directement inspiré de la syntaxe des objets en JavaScript.

## Les règles de syntaxe fondamentales visibles dans le `package.json` :

1. **Les paires clé-valeur :** 
   Les données sont organisées sous forme de clés (toujours entre **guillemets doubles** `""`) suivies d'un deux-points `:`, puis de la valeur associée.
   * *Exemple :* `"name": "scrapwork-app"`

2. **Les objets (délimités par des accolades `{ }`) :** 
   Un fichier JSON commence et finit par des accolades globales. Il peut contenir des objets imbriqués.
   * *Exemple :* `"scripts": { ... }` ou `"dependencies": { ... }`

3. **Les tableaux ou listes (délimités par des crochets `[ ]`) :** 
   Bien qu'il n'y en ait pas directement ici, les crochets servent à lister plusieurs éléments ou valeurs à la suite.

4. **Les types de données :**
   * **Chaînes de caractères (Strings) :** Entre guillemets doubles (ex: `"1.0.0"`).
   * **Nombres (Numbers) :** (Pas présents ici, mais s'écriraient sans guillemets).
   * **Booléens :** `true` ou `false`.

5. **La séparation des éléments :** 
   Chaque paire clé-valeur ou chaque bloc de données doit impérativement être séparé du suivant par une **virgule** `,`. Attention : la toute dernière ligne d'un bloc ne doit **pas** avoir de virgule (sous peine d'erreur de syntaxe).

```json
{
  "name": "scrapwork-app",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "server.mjs",
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=development nodemon server.mjs",
    "prod": "cross-env NODE_ENV=production node server.mjs"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^5.3.0",
    "sqlite3": "^6.0.1"
  },
  "devDependencies": {
    "cross-env": "^10.1.0",
    "nodemon": "^3.1.14"
  }
}
```