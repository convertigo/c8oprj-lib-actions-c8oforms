# Lib_Actions_C8Oforms #

This project contains Actions (sequences) that can be called by Convertigo Forms Builder.\
Deploy this project on the same Convertigo server with **C8OForms** project to enhance your forms with the following features:

## forms_notify_response_by_mail
Sends a mail to the form owner when a new response is submited.

## forms_insert_response_db
Save responses to an external Database.

1. MySQL / MariaDB
    - Symbols :
        - *lib.actions.c8oforms.sql.host* (hostname or IP of the database server)
        - *lib.actions.c8oforms.sql.port* (database server port)
        - *lib.actions.c8oforms.sql.user* (database server username)
        - *lib.actions.c8oforms.sql.pwd* (database server password)