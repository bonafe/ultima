import { EspacoDB } from "./espaco_db.js";

export class LeitorEspacoDB extends EspacoDB{



    static getInstance(){

        if (!LeitorEspacoDB.instancia){
            LeitorEspacoDB.instancia = new LeitorEspacoDB();
        }
        return LeitorEspacoDB.instancia;
    }



    constructor(){
        super();
    }



    async componentes(){        
        return this.lerTodosRegistros("componentes");
    }



    async componente(chave){        
        return this.trazerRegistro(chave, "componentes", "index_nome_componente");
    }



    async elementos(){        
        return this.lerTodosRegistros("elementos");
    }



    async elemento(chave){        
        return this.trazerRegistro(chave, "elementos");
    }



    async acao(chave){        
        return this.trazerRegistro(chave, "acoes");
    }

    async acoes(){        
        return this.lerTodosRegistros("acoes");
    }




    async visualizacoes(){        
        return this.lerTodosRegistros("visualizacoes");
    }

    async visualizacao(chave_visualizacao){        
        return this.trazerRegistro(chave_visualizacao, "visualizacoes");
    }

    
    async elemento_visualizacao(chave_visualizacao, chave_elemento_visualizacao){        
        return this.trazerRegistro(chave_visualizacao, "visualizacoes").then(visualizacao => visualizacao.elementos.find(e => e.uuid == chave_elemento_visualizacao));
    }


    async controladores(){
        return this.lerTodosRegistros("controladores");
    }
}