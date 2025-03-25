export class ConfiguracoesPadrao{

    static base = {
        configuracoes:[
            {
                uuid: "3597ca17-3143-43ee-888e-9b58d7cfc3f0",
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
                uuid: "65ad5d3c-890a-4d44-a06a-6b32db8c0f87",
                nome: "fisica desabilitada",
                descricao: "Física desabilitada",
                configuracao:{
                    physics: {
                        enabled: false,                        
                    }
                }
            },
            {
                uuid: "827f6975-53d1-423e-9987-45195ee881af",
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
                uuid: "fc7c011d-f85d-4f59-8627-f4b6ee8b3d4a",
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