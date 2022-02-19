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
                        "componente":{
                            "url": "/componentes/editor_json/editor_json.js",
                            "nome": "editor-json"
                        },
                        "dados": {"anos":[{ano:2020, mes:"01", selecionado:true},{ano:2020, mes:"02"}, {ano: 2019, mes:"05"}, {ano: 2018, mes:"01"}]}                    
                    },
                    { 
                        "id":2,
                        "descricao": "IFrame Youtube",
                        "importancia": 32,
                        "ordem": 1,
                        "componente-padrao": "exibidor-iframe",
                        "componentes": ["exibidor-iframe", "editor-json"],
                        "componente":{
                            "url": "/componentes/iframe/exibidor_iframe.js",
                            "nome": "exibidor-iframe"
                        },
                        "dados": {
                            "src":"https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1"
                        }                    
                    },                    
                    { 
                        "id":3,
                        "descricao": "IFrame Youtube",
                        "importancia": 32,
                        "ordem": 2,
                        "componente-padrao": "exibidor-iframe",
                        "componentes": ["exibidor-iframe", "editor-json"],
                        "componente":{
                            "url": "/componentes/iframe/exibidor_iframe.js",
                            "nome": "exibidor-iframe"
                        },
                        "dados": {
                            "src":"https://w3c.github.io/webappsec-csp/#directive-frame-ancestors"
                        }                    
                    },
                    { 
                        "id":4,
                        "descricao": "IFrame Youtube",
                        "importancia": 64,
                        "ordem": 3,
                        "componente-padrao": "exibidor-iframe",
                        "componentes": ["exibidor-iframe", "editor-json"],
                        "componente":{
                            "url": "/componentes/iframe/exibidor_iframe.js",
                            "nome": "exibidor-iframe"
                        },
                        "dados": {
                            "src":"https://www.youtube.com/embed/RP7OMTA4gOE"
                        }                    
                    }
                ]            
            }
        ]
    };
}