from datetime import datetime       
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
        # Commande magique: INSERT OR REPLACE: 
        # Avec la clé primaire uuid:
        #   - si la clé n'existe pas dans la base, on fait un INSERT
        #   - si la clé existe, on regarde chaque attribut, et s'il a été modifié, on le remplace
        # Cela évite de devoir scanner les changements avec un attribut "updated" par exemple

        date_start = formater_date(offre.get("date_debut"))
        date_create = formater_date(offre.get("created_at"))
        date_update = formater_date(offre.get("updated_at"))

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
            date_start,
            offre.get("ville"),
            offre.get("type_contrat"),
            str(offre.get("diplome_obliatoire")),
            str(offre.get("niveau_etude")),
            str(offre.get("region_sud")),
            str(offre.get("region_nord")),
            str(offre.get("region_ile")),
            date_create,
            date_update,
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


# Les dates sur data.gouv sont au format 2026-08-31T13:00:00+00:00. On la tronque à partir du "T" pour plus de lisibilité sur la page web.
def formater_date(date_str):
    if not date_str:
        return None
    return date_str.split("T")[0]
