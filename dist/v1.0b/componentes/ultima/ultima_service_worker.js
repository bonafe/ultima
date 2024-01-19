const arquivosCache = [
    '/',
    '/bibliotecas/',
    '/bibliotecas/jspanel/',
    '/bibliotecas/jspanel/jspanel.min.js',
    '/bibliotecas/jspanel/jspanel.min.css',
    '/bibliotecas/tabulator/css/tabulator.min.css',
    '/bibliotecas/tabulator/js/tabulator.min.js',
    '/bibliotecas/visjs/vis-network.min.js',
    '/bibliotecas/visjs/vis-timeline-graph2d.min.js',
    '/bibliotecas/visjs/vis-timeline-graph2d.min.css',
    '/bibliotecas/humanize-duration.js',
    '/bibliotecas/jszip.js',
    '/bibliotecas/FileSaver.min.js',
    '/modulos/atividades/atividades_view.js',
    '/modulos/atividades/atividades_dao.js',
    '/modulos/cpf/CPF.js',
    '/modulos/pessoas/usuario_dao.js',
    '/modulos/processos_trabalho/base/2021_05_02_processos_trabalho_rfb.js',
    '/modulos/processos_trabalho/competencias_view.js',
    '/modulos/processos_trabalho/processos_trabalho_dao.js',
    '/modulos/processos_trabalho/processos_trabalho_view.js',
    '/modulos/OpusDAO.js',
    '/index.html',
    '/trabalho_rfb.js'
    ];
    
    const id_cache = 'opus-cache-v1';
    
    console.log('Service Worker iniciando...');
    
    self.addEventListener('install', event => {
        //debugger;
        console.log('Service Worker instalado!!!');
    
        event.waitUntil(
            caches.open(id_cache)
                .then(cache => {
                    //TODO: se algum arquivo está com o caminho errado ele da erro e não indica onde foi
                    //É importante fazer o código de forma a indicar onde o erro ocorreu
                    return cache.addAll(arquivosCache);
                })
                .catch(e => {
                    console.log ("Erro cache");
                    console.dir(e);
                })
        );
    });
    
    
    
    self.addEventListener('activate', event => {
      console.log('Service Worker ativado!');
    });
    
    
    
    self.addEventListener('fetch', event => {
        console.log (`Service worker: FETCH:${event.request.url}`);
        event.respondWith(
            //Procura o recurso primeiro no endereço remoto
            fetch(event.request)
                .then(resposta => {
    
                    return resposta;
                })
            .catch(() => {
                console.log(`Service worker: FETCH:${event.request.url} --- NÃO ENCONTRADO: puxando do cache local`);
                return caches.match(event.request).then(resposta => resposta);
            })
        );
    });
    
    
    
    self.addEventListener('push', event => {
        event.waitUntil(
            self.registration.showNotification("Título", {
                body: "Você recebeu uma mensagem!",
                tag: "push-tag-exemplo"
            })
        );
    });