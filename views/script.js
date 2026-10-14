
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