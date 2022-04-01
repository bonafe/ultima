import { UltimaDB } from "./ultima_db.js";

export class UltimaDBReader extends UltimaDB{



    static getInstance(){

        if (!UltimaDBReader.instancia){
            UltimaDBReader.instancia = new UltimaDBReader();
        }
        return UltimaDBReader.instancia;
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




    async views(){        
        return this.lerTodosRegistros("views");
    }

    async view(chave){        
        return this.trazerRegistro(chave, "views");
    }

    
    async elemento_view(chave, chave_elemento){        
        return this.trazerRegistro(chave, "views").then(view => view.elementos.find(e => e.uuid == chave_elemento));
    }


    async controladores(){
        return this.lerTodosRegistros("controladores");
    }
}