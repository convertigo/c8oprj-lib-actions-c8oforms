# Lib_Actions_C8Oforms #

This project contains Actions (sequences) and Sources (sequences) that can be called by Convertigo Forms Builder.\

Deploy this project on the same Convertigo server with **C8OForms** project to enhance your forms with the following features:

Comments are exposed to Convertigo forms, please follow `formssource_List_of_Ships` sequence as example for multi lang comments

- [Lib_Actions_C8Oforms](#lib_actions_c8oforms)
  - [Actions sequences](#actions-sequences)
    - [forms_notify_response_by_mail](#forms_notify_response_by_mail)
    - [forms_insert_response_db](#forms_insert_response_db)
    - [forms_fill_PDF](#forms_fill_pdf)
  - [Source Sequences](#source-sequences)
    - [formssource_List_of_company_employees](#formssource_list_of_company_employees)
    - [formssource_List_of_Ships](#formssource_list_of_ships)

## Actions sequences
Can be used from an action component (submit), to trigger a server sequence when an user submit a form.

To expose an action sequence to Convertigo forms, you must name your sequence using `forms_` prefix.

In the same way, to expose a variable of your exposed action sequence, you must prefix it's name by `forms_`

### forms_notify_response_by_mail
Sends a mail to the form owner when a new response is submited.\
This can also be used to send mails to multiple addresses.

- Symbols:
    - *lib.actions.c8oforms.smtp.server* (Defines the name or IP address of the SMTP server.)
    - *lib.actions.c8oforms.smtp.port* (Defines the listening port of the SMTP server. Default is 25 for non-auth servers, it can be 587 or 465 for TLS/SSL or STARTTLS servers.)
    - *lib.actions.c8oforms.smtp.security* (Defines the SMTP authentication type.)
    - *lib.actions.c8oforms.smtp.sender* (Defines the email address of the sender.)
    - *lib.actions.c8oforms.smtp.user* (Defines the SMTP server authentication username.)
    - *lib.actions.c8oforms.smtp.pwd* (Defines the SMTP server authentication user password.)
    - *lib.actions.c8oforms.email.xslFilePath* (Defines the file path to the xsl file to be used to built emails).
      -  Default value is .//emails/responseMail2.xsl
      -  You can provide your own xsl file with an external project.
      -  For example: if you provide an external Project1 with the following structure:
         -  Project1
            -  email
               -  customEmail.xsl
      -  You must provide ./Project1/emails/customEmail.xsl as symbole value to use this xsl

- Variables:
    - *forms_mail_subject* (Mail subject - short string)
    - *forms_mail_body* (Mail body - short string)
    - *forms_mail_body_title* (Mail body title - short string)
    - *forms_mail_logo* (URL to a logo image)
    - *forms_mail_recipients_to* (To Mail recipients separated by comma or semicolon.)
    - *forms_mail_recipients_cc* (Cc Mail recipients separated by comma or semicolon.)
    - *forms_mail_recipients_bcc* (Bcc Mail recipients separated by comma or semicolon.)
    - *forms_mail_sender* (Mail recipient for anonymous form. If empty, tries to retrieve mail address from C8OForms account)
    - *forms_mail_notify_owner* (Notify form owner of a new response. true/false)

### forms_insert_response_db
Save responses to an external Database.

1. MySQL / MariaDB
- Symbols:
    - *lib.actions.c8oforms.sql.host* (hostname or IP of the database server)
    - *lib.actions.c8oforms.sql.port* (database server port)
    - *lib.actions.c8oforms.sql.user* (database server username)
    - *lib.actions.c8oforms.sql.pwd* (database server password)

- Variables:
    - *forms_db_type* (Database type. Supports "fs" or "mysql")
    - *forms_db_name* (Database name created to store form responses)
    - *forms_db_destination* (Can be used to override SQL symbols)

### forms_fill_PDF
Fills a PDF Form template from C8OForm responses.

- Variables:
    - *forms_input_pdf_path* (Relative ("./" or ".//) or absolute path of the PDF template.)
    - *forms_output_pdf_path* (Relative ("./" or ".//) or absolute path of the target PDF.)

In your C8OForm form, the **Technical ID** of your component must match the field name in your PDF template.\
For images, use a **Submit** button field and set its desired size in your PDF template.\
For Checkboxes, in your PDF template, name them as **\<C8OForm Technical ID>_N**, where N is a number from 1 to N correponding to the number of checkboxes you have in your C8OForm form.

## Source Sequences
Can be used from a select component as a data source to fill your select. 

To expose a source sequence to Convertigo forms, you must name your sequence using `formssource_` prefix.

Your sequence must have only one variable prefixed with `forms_`, that will be called with searchbar value, to allow you to perform actions, such as filter results for example.

### formssource_List_of_company_employees

Returns you a list of fakes employees (can be filtered).

### formssource_List_of_Ships

Returns you a list of ships (can be filtered).
