export class Painel{
	
	constructor(propriedadesPainel, objetoDeDados){											
													
			this.divConteudoDoPainel = document.createElement("div");			
			this.divConteudoDoPainel.id = propriedadesPainel.id;						
						
			let posicao =  'center-top 0 58';
			
			
			var painel = jsPanel.create({
			    theme:       'primary',
			    headerTitle: propriedadesPainel.titulo,
			    position:   posicao,
			    contentSize: properiedadesPainel.dimensoes.largura + ' ' + properiedadesPainel.dimensoes.altura,
			    content:     this.divConteudoDoPainel,
			    contentOverflow: 'scroll',
			    callback: function () {
			        this.content.style.padding = '20px';
			    }
			});
			
			var detalhePessoa = new DetalhePessoa (urlBase, container.id, idPessoa);
			detalhePessoa.carregar();
		}
	}
	
	telaCheia(){
	}
}