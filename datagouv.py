
import requests

URL_API = "https://data.gouv.nc/api/explore/v2.1/catalog/datasets/offres-d-emploi-deposees-sur-le-site-emploi-nc/records"


# Récupération nombre d'annonces totales
def Nbtot_annonces():
    response = requests.get(URL_API, params={"limit": 0})
    if response.status_code == 200:
        return response.json().get("total_count", 0)
    return 0

# Récupération annonces par paquets de 100
def recuperer_offres(nb_offre_total):

    liste_offres = []
    limit = 100
    offset = 0
    
    print("Connexion à l'API de data.gouv.nc...")

    while offset < nb_offre_total:
        params = {
            "limit": limit,
            "offset": offset
        }
        
        response = requests.get(URL_API, params=params)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("results", [])
            
            if not records:
                break
                
            liste_offres.extend(records)
            print(f"Progression : {len(liste_offres)} / {nb_offre_total} offres récupérées...")
            
            offset += limit
        else:
            print(f"Erreur HTTP {response.status_code} à l'offset {offset}")
            break
            
    print(f"\nExtraction terminée. {len(liste_offres)} offres chargées en mémoire.")
    return liste_offres
