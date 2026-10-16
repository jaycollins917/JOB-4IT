import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';


// Gestion des chemins en mode ES modules (.mjs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Défintion du mode (par défaut "dev" si la variable NODE_ENV n'est pas renseignée)
const currentMode = process.env.NODE_ENV || 'dev';

// Ouverture de la BD

    const dbPath = path.join(__dirname, 'emploi_nc.db');
    const db = new sqlite3.Database(dbPath, sqlite3, (err) => {
        if (err) console.error("Erreur ouverture BD :", err.message);
    });


// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')))


// Route principale
app.get('/', (req, res) => {

    // 1. Requête pour le nombre total d'annonces
    const totalAnnoncesQuery = `
        SELECT COUNT(*) as count 
        FROM offres 
        WHERE (
            (rome_code BETWEEN 'M1800' AND 'M1894' AND rome_code NOT IN ('M1808', 'M1809'))
            OR rome_code IN ('I1403', 'I1404', 'I1406')
        )
    `;

    // 2. Requête pour le nombre d'annonces actives
    const activesAnnoncesQuery = `
        SELECT COUNT(*) as count 
        FROM offres 
        WHERE (
            (rome_code BETWEEN 'M1800' AND 'M1894' AND rome_code NOT IN ('M1808', 'M1809'))
            OR rome_code IN ('I1403', 'I1404', 'I1406')
        )
        AND statut = 'ACTIVE'
    `;

    // 3. Requête pour le nombre d'employeurs uniques
    const totalEmployeursQuery = `
        SELECT COUNT(DISTINCT employer_id) as count 
        FROM offres 
        WHERE (
            (rome_code BETWEEN 'M1800' AND 'M1894' AND rome_code NOT IN ('M1808', 'M1809'))
            OR rome_code IN ('I1403', 'I1404', 'I1406')
        )
    `;

    // 4. Requête principale pour le tableau
    const query = `
        SELECT uuid, titre, enseigne, type_contrat, niveau_etude, diplome, date_debut, created_at, updated_at, statut, rome_code
        FROM offres 
        WHERE (
            (rome_code BETWEEN 'M1800' AND 'M1894' AND rome_code NOT IN ('M1808', 'M1809'))
            OR rome_code IN ('I1403', 'I1404', 'I1406')
        )
        ORDER BY created_at DESC
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
    const query = `SELECT * FROM offres WHERE uuid = ?`;

    db.get(query, [offreUuid], (err, offre) => {
        if (err || !offre) {
            console.error("Offre non trouvée :", err);
            return res.status(404).send("Offre d'emploi introuvable.");
        }
        res.render('detail', { offre });
    });
});


// Route déclenchée au clic sur le bouton CONNEXION
app.post('/run-db', (req, res) => {
    // Exécute le main
    exec('python3 main.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur d'exécution: ${error.message}`);
            return res.status(500).send("Erreur lors de la mise à jour de la base de données.");
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(`Sortie python : ${stdout}`);

        // Redirige l'utilisateur vers la page principale, ce qui va rafraîchir le tableau
        res.redirect('/'); 
    });
});

// Route déclenchée au clic sur le bouton SUPP BD
app.post('/supp-db', (req, res) => {

    // Supprime de la base de données les offres dont le code ROME est '1810'
    const sql = `DELETE FROM offres WHERE rome_code = 'M1810'`;

    db.run(sql, function(err) {
        if (err) {
            console.error(`Erreur lors de la suppression : ${err.message}`);
            return res.status(500).send("Erreur lors de la suppression des données.");
        }
        
        console.log(`${this.changes} annonce(s) avec le code ROME M1810 supprimée(s).`);
        
        // Redirige l'utilisateur vers la page d'accueil pour rafraîchir le tableau
        res.redirect('/');
    });
});

import { spawn } from 'child_process';

// Route SSE pour exécuter main.py et envoyer la progression en direct
app.get('/run-db-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // On lance Python en forçant l'encodage UTF-8 dans l'environnement
    const pythonProcess = spawn('python', ['-u', 'main.py'], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    // On force Node.js à lire la sortie standard en UTF-8
    pythonProcess.stdout.setEncoding('utf8');

    pythonProcess.stdout.on('data', (data) => {
        const text = data.toString();
        res.write(`data: ${JSON.stringify(text)}\n\n`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Erreur Python : ${data}`);
    });

    pythonProcess.on('close', (code) => {
        res.write(`data: ${JSON.stringify("TERMINE")}\n\n`);
        res.end();
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Mode actuel : ${currentMode}`);
});