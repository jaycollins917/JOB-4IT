import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Gestion des chemins en mode ES modules (.mjs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// On définit le mode (par défaut "dev" si la variable NODE_ENV n'est pas renseignée)
const currentMode = process.env.NODE_ENV || 'dev';

// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route principale
app.get('/', (req, res) => {
    res.render('index', { mode: currentMode });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Mode actuel : ${currentMode}`);
});