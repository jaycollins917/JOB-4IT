import sqlite3
NOM_BDD = "emploi_nc.db"

# Création de la BD
def init_BD():
    
    conn = sqlite3.connect(NOM_BDD)
    cursor = conn.cursor()
    
    # Création de la table basée sur les champs de l'API
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS offres (
            uuid TEXT PRIMARY KEY,
            titre TEXT,
            statut TEXT,
            rome_code TEXT,
            date_debut TEXT,
            ville TEXT,
            type_contrat TEXT,
            diplome_obliatoire TEXT,
            niveau_etude TEXT,
            region_sud TEXT,
            region_nord TEXT,
            region_ile TEXT,
            created_at TEXT,
            updated_at TEXT,
            diplome TEXT,
            description TEXT,
            employer_id TEXT,
            enseigne TEXT,
            ville_physique TEXT,
            experience TEXT
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"Base de données '{NOM_BDD}' et table 'offres' initialisées avec succès.")

# Insère ou met à jour les offres dans la base de données SQLite.
def load_BD(liste_offres):

    conn = sqlite3.connect(NOM_BDD)
    cursor = conn.cursor()
    
    compteur = 0
    for offre in liste_offres:
        # On utilise INSERT OR REPLACE pour mettre à jour si le UUID existe déjà
        cursor.execute("""
            INSERT OR REPLACE INTO offres (
                uuid, titre, statut, rome_code, date_debut, ville, type_contrat,
                diplome_obliatoire, niveau_etude, region_sud, region_nord, region_ile,
                created_at, updated_at, diplome, description, employer_id, enseigne,
                ville_physique, experience
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            offre.get("uuid"),
            offre.get("titre"),
            offre.get("statut"),
            offre.get("rome_code"),
            offre.get("date_debut"),
            offre.get("ville"),
            offre.get("type_contrat"),
            str(offre.get("diplome_obliatoire")),
            str(offre.get("niveau_etude")),
            str(offre.get("region_sud")),
            str(offre.get("region_nord")),
            str(offre.get("region_ile")),
            offre.get("created_at"),
            offre.get("updated_at"),
            offre.get("diplome"),
            offre.get("description"),
            offre.get("employer_id"),
            offre.get("enseigne"),
            offre.get("ville_physique"),
            str(offre.get("experience"))
        ))
        compteur += 1

    conn.commit()
    conn.close()
    print(f"{compteur} offres ont été chargées avec succès dans la base SQLite.")