import { GrafoDB } from "./grafo_db.js";

export class LeitorGrafoDB extends GrafoDB{



    static getInstance(){

        if (!LeitorGrafoDB.instancia){
            LeitorGrafoDB.instancia = new LeitorGrafoDB();
        }
        return LeitorGrafoDB.instancia;
    }



    constructor(){
        super();
    }



    async grafos(){        
        return this.lerTodosRegistros("grafos");
    }



    async grafo(chave){        
        return this.trazerRegistro(chave, "grafo", "index_nome_grafo");
    }



    async configuracoes(){        
        return this.lerTodosRegistros("configuracoes");
    }



    async configuracao(chave){        
        return this.trazerRegistro(chave, "configuracoes");
    }
}