export class BaseTestesTreeMap{

    static base = {
        "componentes":[
            {
                "url": "/componentes/data/seletor_meses.js",
                "nome": "seletor-meses"
            },
            {
                "url": "/componentes/editor_json/editor_json.js",
                "nome": "editor-json"
            }
        ],
        "telas": [
            {   
                "id": 1,
                "descricao": "Contatos de A a J",            
                "elementos": [                
                    { 
                        "id":1,
                        "descricao": "Componente 2",
                        "importancia": 16,
                        "ordem": 0,
                        "componente-padrao": "seletor-meses",
                        "componentes": ["seletor-meses", "editor-json"],
                        "dados": [{ano:2020, mes:"01", selecionado:true},{ano:2020, mes:"02"}, {ano: 2019, mes:"05"}, {ano: 2018, mes:"01"}]                    
                    }
                ]            
            }
        ]
    };
}