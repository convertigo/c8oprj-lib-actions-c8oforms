# Lib_Actions_C8Oforms #

This project contains Actions (sequences) that can be called by Convertigo Forms Builder.\
Deploy this project on the same Convertigo server with **C8OForms** project to enhance your forms with the following features:

## forms_notify_response_by_mail
Sends a mail to the form owner when a new response is submited.\
This can also be used to send mails to multiple addresses.

- Symbols:
    - *lib.actions.c8oforms.smtp.server* (Defines the name or IP address of the SMTP server.)
    - *lib.actions.c8oforms.smtp.port* (Defines the listening port of the SMTP server. Default is 25 for non-auth servers, it can be 587 or 465 for TLS/SSL or STARTTLS servers.)
    - *lib.actions.c8oforms.smtp.security* (Defines the SMTP authentication type.)
    - *lib.actions.c8oforms.smtp.sender* (Defines the email address of the sender.)
    - *lib.actions.c8oforms.smtp.user* (Defines the SMTP server authentication username.)
    - *lib.actions.c8oforms.smtp.pwd* (Defines the SMTP server authentication user password.)

- Variables:
    - *forms_mail_subject* (Mail subject - short string)
    - *forms_mail_body* (Mail body - short string)
    - *forms_mail_body_title* (Mail body title - short string)
    - *forms_mail_logo* (URL to a logo image)
    - *forms_mail_recipients* (Mail recipients. First address is necessarily the receiver (TO:) Add addresses separated by comma (,) or semicolon (;) and you can use prefix "TO:", "CC:" (default) or "BCC:")

## forms_insert_response_db
Save responses to an external Database.

1. MySQL / MariaDB
- Symbols:
    - *lib.actions.c8oforms.sql.host* (hostname or IP of the database server)
    - *lib.actions.c8oforms.sql.port* (database server port)
    - *lib.actions.c8oforms.sql.user* (database server username)
    - *lib.actions.c8oforms.sql.pwd* (database server password)

- Variables:
    - *forms_db_type* (supports "fs" or "mysql")
    - *forms_db_name* (Database name created to store form responses)