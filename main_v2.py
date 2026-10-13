import datagouv
import bd




#--------------------------------------------------------
# Main

total = datagouv.Nbtot_annonces()
print(f"Nombre total d'enregistrements détectés sur l'API : {total}")

if total > 0:
    # 2. Extraction (Extract)
    offres = datagouv.recuperer_offres(total)
    
    # 3. Initialisation de la BDD
    bd.init_BD()
    
    # 4. Chargement (Load)
    bd.load_BD(offres)