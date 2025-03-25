import { GrafoDB } from "./grafo_db.js";



export class EscritorGrafoDB extends GrafoDB{


    static getInstance(){

        if (!EscritorGrafoDB.instancia){
            EscritorGrafoDB.instancia = new EscritorGrafoDB();
        }
        return EscritorGrafoDB.instancia;
    }



    constructor(){
        super();

        if (!window.indexedDB) {
            window.alert("Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.");
        }
    }



    async reiniciarBase(){

        await this.aguardarBanco();

        return new Promise ((resolve, reject) => {

            this.limparObjectStore("grafos")
                .then(() => this.limparObjectStore("configuracoes"))
                    .then(() => this.atualizarConfiguracoesPadrao())
                        .then(()=> resolve(true));        
        });      
    }


    
    async atualizarGrafo (grafo){      
        return this.atualizarRegistro (grafo, "grafos");    
    }
    
    async atualizarGrafos (grafos){
        return new Promise((resolve, reject) => {            
            Promise.all(grafos.map (grafo => this.atualizarGrafo(grafo))).then(retornos => {
                resolve(true);
            });            
        });
    }    



    async atualizarConfiguracao (configuracao){      
        return this.atualizarRegistro (configuracao, "configuracoes");    
    }

    async atualizarConfiguracoes (configuracoes){
        return new Promise((resolve, reject) => {            
            Promise.all(configuracoes.map (configuracao => this.atualizarConfiguracao(configuracao))).then(retornos => {
                resolve(true);
            });            
        });
    }    
}