export class BaseTestesTreeMap{

    static base = {
        "proximoId":2,
        "descricao": "Conjunto de telas salvas",
        "telas": [
        {   "id": 1,
            "descricao": "Contatos de A a J",            
            "elementos": [                
                { 
                    "id":1,
                    "descricao": "Componente 2",
                    "importancia": 16,
                    "componente":{                        
                        "url": "/componentes/equipe/grafo_equipe.js",
                        "nome": "grafo-equipe"
                    },                    
                    "dados": {
                        "nome": "equipe principal",
                        "equipes":[
                            {
                                "nome":"equipe 1",
                                "escala":[
                                    {
                                        "nome": "fulano",
                                        "cargo": "cargo"
                                    }
                                ]
                            }
                        ]
                    }
                    
                }
            ]            
        }]
    };
}