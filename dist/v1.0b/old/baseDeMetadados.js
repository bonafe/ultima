"use strict";
class BaseDeMetadados{
	
	
	
	constructor(){		
		this.baseMetadados = [];
	}
	
	
	
	addMetadados (metadados){
		this.baseMetadados.push (metadados);
	}
	
	
	
	procurarMetadados (objeto){
		
		for (let iMetadados in this.baseMetadados){
			
			let objetoMetadado = this.baseMetados[iMetadados];
			
			let todosCamposIguais = true;
			
			for (let campo in objeto){
				
				let existeCampo = false;
				
				for (let metadado in objetoMetadado){
					if (metadado.localeCompare(campo) == 0){
						existeCampo = true;
						break;
					}
				}
				
				if (!existeCampo){
					todosCamposIguais = false;
					break;
				}
			}
			
			if (todosCamposIguais){
				return objetoMetadado;
			}
		}
		return null;
	}
	
	
	
	criarMetadados(objeto){
		
		let metadados = [];
		
		for (let campo in objeto){
			
			let tipo = null;
			
			if (Array.isArray(objeto[campo])){
				
				tipo = "array";
				
			}else if ((typeof objeto[campo]  === "object") && (objeto[campo] != null)){
				
				tipo = "object";
				
			}else{
			
				tipo = "campo";						
			}
			
			let metadado = {
					campo: campo,
					tipo: tipo
			}
			
			metadados.push (metadado);
		}
		
		return metadados;
	}
}