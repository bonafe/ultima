export class BaseTestesTreeMap{

    static base = {
        "descricao": "Conjunto de telas salvas",
        "telas": [
        {   "id": 1,
            "descricao": "Contatos de A a J",            
            "componentes": [                
                { 
                    "descricao": "Componente 2",
                    "importancia": 16,
                    "componente":{                        
                        "url": "/componentes/editor_json/editor_json.js",
                        "nome": "editor-json"
                    },                    
                    "dados":{
                        "nome":"valor do nome tipo string",
                        "lista":["elemento1",2,3,4,true,false,{"id":"12"},[1,2,3]],
                        "objeto":{
                            "titulo":"esse é o título",
                            "ano":1913
                        }
                    }
                }
            ]            
        }]
    };
}