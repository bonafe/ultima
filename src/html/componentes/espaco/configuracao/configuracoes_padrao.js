export class ConfiguracoesPadrao{

    static base = {
        "componentes":[
            {
                "url": "./componentes/data/seletor_meses.js",
                "nome": "seletor-meses"
            },
            {
                "url": "./componentes/dados/json/editor/editor_json.js",
                "nome": "editor-json"
            },
            {
                "url": "./componentes/iframe/exibidor_iframe.js",
                "nome": "exibidor-iframe"
            },
            {
                "url": "./componentes/imagem/exibidor_imagem.js",
                "nome": "exibidor-imagem"
            },
            {
                "url": "./componentes/contatos/contatos_view.js",
                "nome": "contatos-visualizacao"
            },
            {
                "url": "./componentes/espaco/configuracao/configuracao.js",
                "nome": "configuracao-espaco"
            },
            ,
            {
                "url": "./componentes/dados/grafo/grafo_bases.js",
                "nome": "grafo-bases"
            },
            {
                "url": "./componentes/dados/grafo/grafo_indexeddb.js",
                "nome": "grafo-indexeddb"
            },
            {
                "url": "./componentes/equipe/grafo/grafo_equipe.js",
                "nome": "grafo-equipe"
            },
            {
                "url": "./componentes/dados/uuid/gerador_uuid.js",
                "nome": "gerador-uuid"
            },
            {
                "url": "./componentes/dados/json/diferencas/visualizador_diferencas_json.js",
                "nome": "visualizador-diferencas-json"
            },
            {
                "url": "./componentes/video/exibidor_camera.js",
                "nome": "exibidor-camera"
            },
            {
                "url": "./componentes/dispositivo/exibidor_dispositivos.js",
                "nome": "exibidor-dispositivos"
            },
            {
                "url": "./componentes/som/visualizacao/visualizador_som.js",
                "nome": "visualizador-som"
            }
        ],
        "controladores":[
            {
                "url": "./componentes/espaco/controlador.js",
                "nome_classe": "ControladorEspaco"
            },
            {
                "url": "./componentes/dispositivo/controlador_dispositivos.js",
                "nome_classe": "ControladorDispositivos"
            },
            {
                "url": "./componentes/dados/json/diferencas/controlador_visualizador_diferencas_json.js",
                "nome_classe": "ControladorVisualizadorDiferencasJSON"
            }
        ]
    };
}