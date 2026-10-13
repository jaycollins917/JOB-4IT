import requests

URL_API = "https://data.gouv.nc/api/explore/v2.1/catalog/datasets/offres-d-emploi-deposees-sur-le-site-emploi-nc/records"

# ------------------------------------------------------------------------------------------------------------------------
# Un petit échauffement avant d'attaquer toutes les offres. 
# À chaque requête, on a systématiquement le nb d'enregistrements total. Il suffit donc de faire une requête de longueur 0.

response = requests.get(URL_API, params={"limit": 0})

if response.status_code == 200:
    data = response.json()
    print(data)
    
    # On extrait le nombre total d'enregistrements
    nb_offre_total = data.get("total_count", 0)
    
    print(f"Nombre total d'offres sur data.gouv.nc : {nb_offre_total}")
else:
    print("Erreur lors de la requête")


# ------------------------------------------------------------------------------------------------------------------------
# Un autre petit échauffement avant d'attaquer toutes les offres.
# On récupère deux offre, et on les met dans un fichier json.

import json  # Module qui permet de convertir les données python en Json

URL_API = "https://data.gouv.nc/api/explore/v2.1/catalog/datasets/offres-d-emploi-deposees-sur-le-site-emploi-nc/records"

def deux_offres():
    params = {
        "limit": 2
    }
    
    print("Requête en cours vers l'API de data.gouv.nc...")
    response = requests.get(URL_API, params=params)
    
    if response.status_code == 200:
        data = response.json()
        records = data.get("results", [])           # Attention on a des données sous forme de liste, ce n'est pas le format json.
        
        print(f"Succès ! {len(records)} offres récupérées.")
        
        # Création d'un fichier json et d'un fichier txt pour comparer
        nom_fichier = "z_deux_offres.json"
        nom_fichier_txt = "z_deux_offres.txt"
        
        with open(nom_fichier, "w", encoding="utf-8") as f:                                                                
            
            json.dump(records, f, ensure_ascii=False, indent=4)     # json.dump convertit l'objet Python en texte JSON et indent=4 permet de formater le fichier pour qu'il soit bien lisible (indenté)
            
        with open(nom_fichier_txt, "w", encoding="utf-8") as f:                                                                
            
            #print(type(records))
            f.write(str(records))


        print(f"Les offres ont été enregistrées avec succès dans le fichier : {nom_fichier}")
        
    else:
        print(f"Erreur HTTP : {response.status_code}")

#deux_offres()

# --------------------------------------------------------------------------------
# C'est parti on récupère tout maintenant
# Récuperer les offres par paquets de 100
def recuperer_offres():

    liste_offres = []   # Contiendra a fur et à mesure la liste de toutes les offres
    limit = 100         # Nombre d'offres par requête
    offset = 0
    
    print("Connexion à l'API de data.gouv.nc...")

    # Boucle de récupération par paquets 

    while offset < 100:                  
#    while offset < nb_offre_total:                  
        params = {
            "limit": limit,
            "offset": offset
        }
        
        response = requests.get(URL_API, params=params)                 # Premier tour: on récupère 100 offres à partir de l'offset 0
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("results", [])
            
            if not records:
                break
                
            liste_offres.extend(records)            # extend est une méthode qui ajoute des objets à l'intérieur de la liste.
            print(f"Progression : {len(liste_offres)} / {nb_offre_total} offres récupérées...")
            
            # On décale l'offset pour le paquet suivant
            offset += limit
        else:
            print(f"Erreur HTTP {response.status_code} à l'offset {offset}")
            break
            
    print(f"\n✨ Opération terminée ! {len(liste_offres)} offres ont été chargées en mémoire.")
    return liste_offres

