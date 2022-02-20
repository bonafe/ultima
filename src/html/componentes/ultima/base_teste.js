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
                        "id":7,
                        "descricao": "Imagem Treemap D3.js",
                        "importancia": 16,
                        "ordem": 3,
                        "componente-padrao": "exibidor-imagem",
                        "componentes": ["exibidor-imagem", "editor-json"],
                        "componente":{
                            "url": "/componentes/imagem/exibidor_imagem.js",
                            "nome": "exibidor-imagem"
                        },
                        "dados": {
                            "src":"./imagens/exemplo_treemap_d3js.png",
                            "origem":"https://observablehq.com/@d3/treemap"
                        }                    
                    },
                    { 
                        "id":8,
                        "descricao": "Google Maps",
                        "importancia": 100,
                        "ordem": 3,
                        "componente-padrao": "exibidor-iframe",
                        "componentes": ["exibidor-iframe", "editor-json"],
                        "componente":{
                            "url": "/componentes/iframe/exibidor_iframe.js",
                            "nome": "exibidor-iframe"
                        },
                        "dados": {
                            "src":"https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d10881470.019101504!2d-57.21986250424784!3d-14.247311386949713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1645306504298!5m2!1spt-BR!2sbr",
                        }                    
                    },
                    { 
                        "id":9,
                        "descricao": "OpenStreetMap",
                        "importancia": 100,
                        "ordem": 3,
                        "componente-padrao": "exibidor-iframe",
                        "componentes": ["exibidor-iframe", "editor-json"],
                        "componente":{
                            "url": "/componentes/iframe/exibidor_iframe.js",
                            "nome": "exibidor-iframe"
                        },
                        "dados": {
                            "src":"https://www.openstreetmap.org/export/embed.html?bbox=-48.88641357421876%2C-23.755181766112624%2C-45.81298828125001%2C-22.664709810176827&amp;layer=mapnik",
                        }                    
                    },                          
                ]            
            }
        ]
    };
}