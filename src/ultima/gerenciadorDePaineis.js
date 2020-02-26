
export class GerenciadorDePaineis{
	
	constructor(){
		this.paineis = [];
		
		//Ainda não existem painéis
		this.idPainelAtual = 0;
	}
	
	criarPainel(tituloPainel){
		
		this.idPainelAtual++;			
		
		let propriedadesPainel{
			id: "painel_" + this.idPainelAtual,
			titulo: tituloPainel,
			dimensoes:{
				altura: window.innerHeight * 0.8,
				largura:window.innerWidth* 0.8
			}
		}
	}
}
