
// Ce script trie le tableau en fonction des champs d'en-tête

document.addEventListener('DOMContentLoaded', () => {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    document.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        const idx = Array.from(th.parentNode.children).indexOf(th);
        
        // On mémorise l'état du tri par colonne
        th.asc = !th.asc;
        
        Array.from(tbody.querySelectorAll('tr'))
            .sort((a, b) => {
                const valA = getCellValue(th.asc ? a : b, idx);
                const valB = getCellValue(th.asc ? b : a, idx);
                
                // Tri numérique si possible, sinon alphabétique
                const numA = Number(valA);
                const numB = Number(valB);
                
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return valA.localeCompare(valB, 'fr', { numeric: true });
            })
            .forEach(tr => tbody.appendChild(tr));
    }));
});

document.addEventListener('DOMContentLoaded', function() {
    const btnConnex = document.getElementById('btn-connex');

    btnConnex.addEventListener('click', function() {
        console.log("coucou");
        const btnsupp = document.getElementById('btn-supp');
        const container = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressLabel = document.getElementById('progress-label');
        const progressFin = document.getElementById('progress-fin');

        // Sinon ça bug
        btnConnex.disabled = true;
        btnConnex.style.opacity = '0.5';
        btnsupp.style.opacity = '0.5';
        btnsupp.disabled = true;

        container.style.display = 'block';

        const eventSource = new EventSource('/run-db-stream');    

        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            if (data.includes("Progression :")) {
                if (progressLabel) progressLabel.innerText = data.trim();
                
                const match = data.match(/Progression :\s*(\d+)\s*\/\s*(\d+)/);
                if (match && progressBar) {
                    const current = parseInt(match[1]);
                    const total = parseInt(match[2]);
                    if (total > 0) {
                        const percent = (current / total) * 100;
                        progressBar.style.width = percent + '%';
                    }
                }
            } 
            else if (data.trim() === "TERMINE") {
                eventSource.close();
                progressBar.style.width = '100%';

                btnConnex.disabled = false;
                btnConnex.style.opacity = '1';
                btnsupp.disabled = false;
                btnsupp.style.opacity = '1';

                let seconds = 5;
               
                // Décrémentation chaque seconde (1000 ms)
                const countdown = setInterval(() => {
                    seconds--;
                    if (seconds > 0) {
                        progressFin.innerHTML = progressFin.innerHTML = `Mise à jour terminée. Actualisation de la page dans ${seconds}s...`;                        
                    } 
                    else {
                        clearInterval(countdown);
                        location.reload();
                    }
                }, 1000);                        
            }
        };

        eventSource.onerror = function(err) {
            console.error("Erreur SSE:", err);
            eventSource.close();

            if (progressLabel) progressLabel.innerText = "Erreur lors de la synchronisation.";

            btnConnex.disabled = false;
            btnConnex.style.opacity = '1';
            btnsupp.disabled = false;
            btnsupp.style.opacity = '1';
            
        };
    });
});


