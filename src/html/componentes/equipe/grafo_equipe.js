import { ComponenteBase } from '../componente_base.js';



export class GrafoEquipe extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/equipe/grafo_equipe.html", shadowDOM:true});
        
        this.addEventListener("carregou", () => {
        
            //Importa dinamicamente a biblioteca JSONEditor
            //import(`${super.prefixoEndereco}/bibliotecas/vis.js/vis.js`).then(modulo => {

                this.vis = true;
                this.gerarGrafoEquipe();                               
            //});
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
            let grafo = new vis.Network (this.noRaiz.querySelector("#divGrafo"), elementosGrafo, options);
        }
    }



    transformarListaEmGrafo (equipes, idPai, nivel){

        let elementosGrafo = {nodes:[], edges:[]};

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

            elementosGrafo.nodes.push(no);
            elementosGrafo.edges.push(ligacao);


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

                elementosGrafo.nodes.push(no);
                elementosGrafo.edges.push(ligacao);
            }


            if (equipe.equipes != null){

                if (Object.keys(equipe.equipes).length > 0){

                    let elementosGrafoGerados = this.transformarListaEmGrafo(equipe.equipes, idEquipe, nivel-10);
                    elementosGrafo.nodes = elementosGrafo.nodes.concat(elementosGrafoGerados.nodes);
                    elementosGrafo.edges = elementosGrafo.edges.concat(elementosGrafoGerados.edges);
                }
            }
        }

        return elementosGrafo;
    }
}

window.customElements.define('grafo-equipe', GrafoEquipe);




