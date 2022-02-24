export class BaseInicialUltima{

    static base = {
        "componentes":[
            {
                "url": "/componentes/data/seletor_meses.js",
                "nome": "seletor-meses"
            },
            {
                "url": "/componentes/editor_json/editor_json.js",
                "nome": "editor-json"
            },
            {
                "url": "/componentes/iframe/exibidor_iframe.js",
                "nome": "exibidor-iframe"
            },
            {
                "url": "/componentes/imagem/exibidor_imagem.js",
                "nome": "exibidor-imagem"
            },
            {
                "url": "/componentes/contatos/contatos_view.js",
                "nome": "contatos-view"
            },
            {
                "url": "/componentes/ultima/configuracao_ultima.js",
                "nome": "configuracao-ultima"
            }
        ],
        "telas": [
            {   
                "id": 1,
                "descricao": "Contatos de A a J",            
                "elementos": [                                   
                    { 
                        "id":1,
                        "descricao": "Configuração Última",
                        "importancia": 16,
                        "ordem": 0,
                        "componente":{
                            "padrao": "exibidor-imagem",                            
                        },
                        "dados": {
                            "src":"/imagens/hubble.jpg"
                        }
                    }                         
                ]            
            }
        ]
    };
}