import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';


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
app.use(express.static(path.join(__dirname, 'views')))


/*
// Route principale
app.get('/', (req, res) => {
    res.render('index', { mode: currentMode });
});
*/

// Route principale
app.get('/', (req, res) => {
    const dbPath = path.join(__dirname, 'emploi_nc.db');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) console.error("Erreur ouverture BDD :", err.message);
    });

    // 1. Requête pour le nombre total d'annonces
    const totalAnnoncesQuery = `
        SELECT COUNT(*) as count 
        FROM offres 
        WHERE rome_code BETWEEN 'M1800' AND 'M1894'
        AND rome_code NOT IN ('M1808', 'M1809')
    `;

    // 2. Requête pour le nombre d'annonces actives
    const activesAnnoncesQuery = `
        SELECT COUNT(*) as count 
        FROM offres 
        WHERE rome_code BETWEEN 'M1800' AND 'M1894'
        AND rome_code NOT IN ('M1808', 'M1809')
        AND statut = 'ACTIVE'
    `;

    // 3. Requête pour le nombre d'employeurs uniques
    const totalEmployeursQuery = `
        SELECT COUNT(DISTINCT employer_id) as count 
        FROM offres 
        WHERE rome_code BETWEEN 'M1800' AND 'M1894'
        AND rome_code NOT IN ('M1808', 'M1809')
    `;

    // 4. Requête principale pour le tableau
    const query = `
        SELECT uuid, titre, enseigne, type_contrat, niveau_etude, diplome, date_debut, created_at, updated_at, statut, rome_code
        FROM offres 
        WHERE rome_code BETWEEN 'M1800' AND 'M1894'
        AND rome_code NOT IN ('M1808', 'M1809')
    `;

    // Exécution en cascade propre pour récupérer toutes les variables
    db.get(totalAnnoncesQuery, [], (err, resAnnonces) => {
        const totalAnnonces = resAnnonces ? resAnnonces.count : 0;

        db.get(activesAnnoncesQuery, [], (err, resActives) => {
            const totalActives = resActives ? resActives.count : 0;

            db.get(totalEmployeursQuery, [], (err, resEmployeurs) => {
                const totalEmployeurs = resEmployeurs ? resEmployeurs.count : 0;

                // Enfin, on récupère les lignes du tableau et on ferme la base
                db.all(query, [], (err, rows) => {
                    db.close();
                    if (err) {
                        console.error("Erreur SQL :", err.message);
                        return res.status(500).send("Erreur lors de la lecture de la base de données.");
                    }

                    // On envoie tout au template EJS
                    res.render('index', { 
                        offres: rows, 
                        mode: currentMode, 
                        totalAnnonces, 
                        totalActives, 
                        totalEmployeurs 
                    });
                });
            });
        });
    });
});


// Route pour afficher les détails d'une offre
app.get('/offre/:uuid', (req, res) => {
    const offreUuid = req.params.uuid;
    const dbPath = path.join(__dirname, 'emploi_nc.db');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) console.error("Erreur ouverture BDD :", err.message);
    });

    const query = `SELECT * FROM offres WHERE uuid = ?`;

    db.get(query, [offreUuid], (err, offre) => {
        db.close();
        if (err || !offre) {
            console.error("Offre non trouvée :", err);
            return res.status(404).send("Offre d'emploi introuvable.");
        }
        res.render('detail', { offre });
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Mode actuel : ${currentMode}`);
});