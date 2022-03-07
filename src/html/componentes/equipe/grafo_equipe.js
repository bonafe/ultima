import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';


export class GrafoEquipe extends ComponenteBase {
    

    constructor(){
        super({templateURL:"./grafo_equipe.html", shadowDOM:true}, import.meta.url);
        
        this.addEventListener("carregou", () => {
        
            //TODO: carregar dinamicamente o vis.js
            //Importa dinamicamente a biblioteca JSONEditor
            //import(`${super.prefixoEndereco}/bibliotecas/vis.js/vis.js`).then(modulo => {

                this.vis = true;
                this.gerarGrafoEquipe();                               
            //});

            this.noRaiz.querySelector("#adicionar").addEventListener("click", ()=>{
                this.elementosGrafo.nodes.add({
                    id:(Math.random()*1e7).toString(32),
                    label: "novo nó"
                })
            });
        });
    }



    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

        if (nomeAtributo.localeCompare("dados") == 0){
            let dados = JSON.parse(novoValor);

            if (dados.url){ 
                this.url = dados.url;

                fetch(this.url)
                    .then(retorno => retorno.json())
                    .then(json => {
                        this.dados = json;
                        this.gerarGrafoEquipe();
                    })
                    .catch (e => alert (e));

            }else{
                this.dados = dados;
                this.gerarGrafoEquipe();
            }
        }
    } 


   gerarGrafoEquipe (){

        if (this.vis && this.dados){


            this.idGrafo = 0;
            let elementosGrafo = this.transformarListaEmGrafo([this.dados], this.idGrafo++, 70);

            let options = {
                physics: {
                    stabilization: false,                    
                  }
            };
            this.elementosGrafo = elementosGrafo;
            let grafo = new vis.Network (this.noRaiz.querySelector("#divGrafo"), this.elementosGrafo, options);            

            grafo.on ("click", parametros => {
                console.dir(parametros);
                this.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO, parametros));
            });

            //window.requestAnimationFrame(this.animarGrafo.bind(this));
        }
    }

    animarGrafo(timestamp){
        if (!this.inicio) this.inicio = timestamp;
        this.elementosGrafo.nodes.update(
            this.elementosGrafo.nodes.get().map(no => {        
                no.color = ((Math.random() < 0.5) ?"red" :"blue");
                return no;
            })
        );
        
        window.requestAnimationFrame(this.animarGrafo.bind(this));
    }



    transformarListaEmGrafo (equipes, idPai, nivel){

        let elementosGrafo = {nodes:new vis.DataSet(), edges:new vis.DataSet()};

        for (let iEquipe in equipes){

            let equipe = equipes[iEquipe];
            let idEquipe = this.idGrafo++;

            let no = {
                label: equipe.nome,
                id: idEquipe,
                value: nivel
            };

            let ligacao = {
                    from: idPai,
                    to: idEquipe
            }

            elementosGrafo.nodes.add(no);
            elementosGrafo.edges.add(ligacao);


            for (let iEscala in equipe.escala){

                let escala = equipe.escala[iEscala];
                let idEscalaGrafo = this.idGrafo++;

                var nomePessoa = "";

                //Se a pessoa tiver apelido, aparece o apelido
                if (escala.apelido != null){
                    nomePessoa = escala.apelido + ".";

                //Caso contrário aparecem as 20 primeiras letras do nome completo
                }else{
                    nomePessoa = escala.nome.substring (0,10) + ".";
                }


                let shape = "circle";
                let color = "#FFA807";

                if (escala.cargo.indexOf("AT") != -1){
                    shape = "triangle";
                    color = "#00bfff";

                }else if (escala.cargo.indexOf("AF") != -1){
                    shape = "star";
                    color = "#FFFF00";

                }else if (escala.cargo.indexOf("Serpro") != -1){
                    shape = "box";
                    color = "#80ff00";

                }else if (escala.cargo.indexOf("Estagiário") != -1){
                    shape = "box";
                    color = "#fe3523";

                }
                

                let no = {
                        label: nomePessoa,
                        id: idEscalaGrafo,
                        color: color,
                        shape: shape
                }

                let ligacao = {
                        from: idEquipe,
                        to: idEscalaGrafo
                }

                elementosGrafo.nodes.add(no);
                elementosGrafo.edges.add(ligacao);
            }


            if (equipe.equipes != null){

                if (Object.keys(equipe.equipes).length > 0){

                    let elementosGrafoGerados = this.transformarListaEmGrafo(equipe.equipes, idEquipe, nivel-10);
                    elementosGrafo.nodes.add(elementosGrafoGerados.nodes.get());
                    elementosGrafo.edges.add(elementosGrafoGerados.edges.get());
                }
            }
        }

        return elementosGrafo;
    }
}

window.customElements.define('grafo-equipe', GrafoEquipe);




