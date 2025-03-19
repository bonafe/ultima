export class ConfiguracoesPadrao{

    static base = {
        configuracoes:[
            {
                nome: "fisica habilitada",
                descricao: "Física padrão habilitada",
                configuracao:{
                    physics: {
                        enabled: true,
                        solver: "barnesHut",
                        stabilization: { enabled: true, iterations: 1000 }
                    }
                }
            },
            {
                nome: "fisica desabilitada",
                descricao: "Física desabilitada",
                configuracao:{
                    physics: {
                        enabled: false,                        
                    }
                }
            },
            {
                nome: "modo de interação",
                descricao: "Mostra comandos para interação com o grafo",
                configuracao: {
                    interaction: {
                        dragNodes: true,
                        dragView: true,
                        zoomView: true
                    }
                }
            },
            {
                nome: "modo de manipulação",
                descricao: "Permite adicionar, editar e remover nós e ligações",
                configuracao: {
                    manipulation: {
                        enabled: true,                        
                    },
                }
            }
        ]
    };
}