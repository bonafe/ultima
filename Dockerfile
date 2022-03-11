FROM httpd:2.4
ARG DIRETORIO_PUPLICACAO=./dist/
COPY ${DIRETORIO_PUPLICACAO} /usr/local/apache2/htdocs/
