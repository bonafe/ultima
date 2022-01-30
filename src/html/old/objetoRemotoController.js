"use strict";
class ObjetoRemotoController{

	
	
	constructor(baseDeMetadados, objetoRemotoModel, objetoRemotoView, objetoRemotoMetadadosView){
		
		this.baseDeMetadados = baseDeMetadados;
		
		this.objetoRemotoView = objetoRemotoView;
		this.objetoRemotoMetadadosView = objetoRemotoMetadadosView;
		this.objetoRemotoModel = objetoRemotoModel;
		
		this.objetoRemotoModel.bindObjetoRemotoMudou (this.tratarMudancaDoObjetoRemoto);
		this.objetoRemotoView.bindCarregarEndpoint(this.tratarCarregarEndpoint);
	}
	
	
	
	tratarCarregarEndpoint = endpoint => {
		fetch (endpoint)
			.then(response => response.json())
			.then(result => {
				console.log(result);
				this.objetoRemotoModel.atualizarObjetoRemoto (result);
			})
			.catch(function(error){
				alert (error);
			});
	}
	
	
	
	tratarMudancaDoObjetoRemoto = (objetoRemoto) =>{		
		
		this.objetoRemotoView.renderizarObjetoRemoto (objetoRemoto);
		
		let metadados = this.baseDeMetadados.procurarMetadados (objetoRemoto);
		if (metadados === null){
			metadados = this.baseDeMetadados.criarMetadados (objetoRemoto);
			this.baseDeMetadados.addMetadados (metadados);
		}
		this.objetoRemotoMetadadosView.renderizarMetadados (metadados);
	}
}