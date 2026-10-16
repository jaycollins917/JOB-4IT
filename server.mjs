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


// Fonction qui récupère des stats globales qui vont servir à la page d'accueil et à la page de stats
function getGlobalStats(callback) {

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

                // On renvoie le tout via un objet de callback
                callback({ totalAnnonces, totalActives, totalEmployeurs });

            });
        });
    });
}


// Route principale
app.get('/', (req, res) => {
    // On récupère d'abord les stats globales
    getGlobalStats((stats) => {
        // Requête filtrée pour ne garder que les offres IT dans le tableau
        const query = `
            SELECT uuid, titre, enseigne, type_contrat, niveau_etude, diplome, date_debut, created_at, updated_at, statut, rome_code
            FROM offres 
            WHERE (
                (rome_code BETWEEN 'M1800' AND 'M1894' AND rome_code NOT IN ('M1808', 'M1809'))
                OR rome_code IN ('I1403', 'I1404', 'I1406')
            )
            ORDER BY created_at DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("Erreur SQL :", err.message);
                return res.status(500).send("Erreur lors de la lecture de la base de données.");
            }

            res.render('index', { 
                offres: rows, 
                mode: currentMode, 
                ...stats 
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


// Route pour la page des statistiques
app.get('/stats', (req, res) => {
    getGlobalStats((stats) => {
        db.all("SELECT * FROM offres", [], (err, rows) => {
            if (err) {
                console.error("Erreur SQL :", err.message);
                return res.status(500).send("Erreur lors de la lecture de la base de données.");
            }

            // --- 1. Secteurs ROME ---
            const sectorStats = {
                DevWeb: 0,
                Cyber: 0,
                AdminReseau: 0,
                Technicien: 0,
                Data: 0,
                Management: 0
            };

            const devWebCodes = ["M1805", "M1813", "M1814", "M1815", "M1818", "M1824", "M1825", "M1831", "M1832", "M1834", "M1836", "M1837", "M1841", "M1842", "M1845", "M1848", "M1850", "M1851", "M1852", "M1853", "M1855", "M1861", "M1864", "M1865", "M1872", "M1873", "M1877", "M1886", "M1887", "M1889", "M1892", "M1894", "M1822", "M1868"];
            const cyberCodes = ["M1812", "M1817", "M1819", "M1833", "M1846", "M1856", "M1863", "M1866", "M1882", "M1883"];
            const adminReseauCodes = ["M1801", "M1802", "M1804", "M1806", "M1807", "M1823", "M1826", "M1827", "M1829", "M1830", "M1835", "M1839", "M1843", "M1849", "M1857", "M1860", "M1862", "M1869", "M1871", "M1876", "M1879", "M1884", "M1885", "M1896"];
            const technicienCodes = ["I1403", "I1404", "I1406", "M1810", "M1816", "M1858", "M1874", "M1878"];
            const dataCodes = ["M1811"];
            const managementCodes = ["M1803", "M1828", "M1838", "M1840", "M1844", "M1859", "M1867", "M1870", "M1875", "M1881"];

            // --- 2. Histogramme mensuel ---
            const monthlyCounts = {};

            rows.forEach(offre => {
            const rome = (offre.rome_code || "").trim().toUpperCase();

            // 1. Vérification si l'offre fait partie des secteurs IT
            const isIT = devWebCodes.some(code => rome.startsWith(code)) ||
                            cyberCodes.some(code => rome.startsWith(code)) ||
                            adminReseauCodes.some(code => rome.startsWith(code)) ||
                            technicienCodes.some(code => rome.startsWith(code)) ||
                            rome.startsWith("I14") ||
                            dataCodes.some(code => rome.startsWith(code)) ||
                            managementCodes.some(code => rome.startsWith(code));

            // 2. Incrémentation pour le camembert (secteurs)
            if (devWebCodes.some(code => rome.startsWith(code))) sectorStats.DevWeb++;
            else if (cyberCodes.some(code => rome.startsWith(code))) sectorStats.Cyber++;
            else if (adminReseauCodes.some(code => rome.startsWith(code))) sectorStats.AdminReseau++;
            else if (technicienCodes.some(code => rome.startsWith(code)) || rome.startsWith("I14")) sectorStats.Technicien++;
            else if (dataCodes.some(code => rome.startsWith(code))) sectorStats.Data++;
            else if (managementCodes.some(code => rome.startsWith(code))) sectorStats.Management++;

            // 3. Histogramme : on ne comptabilise QUE si c'est de l'IT
            if (isIT) {
                // Remplace "date_publication" par le nom exact de ta colonne de date en base si besoin
                const rawDate = offre.date_publication || offre.created_at || ""; 
                if (rawDate) {
                    const monthKey = rawDate.substring(0, 7); // Format "YYYY-MM"
                    monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
                }
            }
        });

            // Trier les mois par ordre chronologique
            const sortedMonths = Object.keys(monthlyCounts).sort();
            const monthlyStats = {
                labels: sortedMonths,
                data: sortedMonths.map(m => monthlyCounts[m])
            };

            res.render('stats', { 
                sectorStats, 
                monthlyStats,
                ...stats 
            });
        });
    });
});





// Ouverture du port d'écoute
app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});