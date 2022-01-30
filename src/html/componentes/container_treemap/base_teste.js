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
                        "url": "/componentes/editor_json/editor_json.js",
                        "nome": "editor-json"
                    },                    
                    "dados":{
                        "descricao":"Lista de Contatos",
                        "contatos":[
                            {"nome":"fulano", "telefone":"(ddd)nnnn-nnnn", "email":"email@email.com"},
                            {"nome":"siclano", "telefone":"(ddd)nnnn-nnnn", "email":"email@email.com"},
                            {"nome":"beltrano", "telefone":"(ddd)nnnn-nnnn", "email":"email@email.com"}
                        ]                        
                    }
                }
            ]            
        }]
    };
}