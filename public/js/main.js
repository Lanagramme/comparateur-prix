function addMagasin(nom, adress) { postData({name:nom,adress:adress}, "magasin") }
    function addProduit(nom) {postData({name:nom}, "produit")}
    function addInstance(nom, category, prix, quantite, unite, magasin) {
        postData(
            {
                name: nom,
                price: prix,
                quantity: quantite,
                unit: unite,
                magasin: magasin,
                category: category,
            }, 
            "instance"
        )
    }
    function postData(item,collection){
        $.ajax({
            type: "POST",
            url: "/post/"+collection,
            data: item
        }).then(x => console.log(x))
    }