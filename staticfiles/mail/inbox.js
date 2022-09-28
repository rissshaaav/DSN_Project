document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function send_email() {
  var recipients = document.querySelector('#compose-recipients').value;
  var subject = document.querySelector('#compose-subject').value;
  var body = document.querySelector('#compose-body').value;
  if (recipients != '') {
    var recs = recipients.split(", ");
    var validated = true;
    for (mail in recs) {
      if (!validateEmail(recs[mail])) {
        validated = false;
      }
    }
    if (validated) {
      for (mail in recs) {
        fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
            recipients: recs[mail],
            subject: subject,
            body: body
          })
        })
          .then(response => response.json())
          .then(result => {
            console.log(result);
            var mes = document.querySelector('#message');
            if (result['error']){
              mes.innerHTML = `User with ${recs[mail]} does NOT exist`;
              mes.style.color = 'red';
            }
            else{
              mes.innerHTML = '';
              load_mailbox('sent');
            }
          });
      }
    }
    else {
      var mes = document.querySelector("#message");
      mes.innerHTML = "Please enter valid email addresses seperated by \" ,\"";
      mes.style.color = "red";
    }
  }
  else {
    var mes = document.querySelector("#message");
    mes.innerHTML = "Please enter one or more email addresses."
    mes.style.color = "red";
  }
}
function load_mailbox(mailbox) {
  var email_view = document.querySelector('#emails-view')
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  email_view.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  email_view.innerHTML = '';
  email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      if (emails.length == 0) {
        email_view.innerHTML = '<p style = "font-size: large; font-weight: bold;">Nothing to see here :(</p>';
      }
      else {
        for (email in emails) {
          var mail = document.createElement("div");
          var sender = document.createElement('h5');
          var sub = document.createElement('p');
          var time = document.createElement('p');
          var id = document.createElement('p');
          id.innerHTML = emails[email]['id'];
          id.style.display = 'none';
          sender.innerHTML = emails[email]['sender'];
          if (emails[email]['subject'] == '') {
            sub.innerHTML = 'No Subject';
            sub.style.color = 'red';
          }
          else {
            sub.innerHTML = emails[email]['subject'];
          }
          time.innerHTML = emails[email]['timestamp'];
          mail.style.borderStyle = 'solid';
          mail.style.borderColor = 'green';
          mail.style.borderWidth = '0.1rem';
          mail.style.marginBottom = '0.2rem';
          if (emails[email]['read'] == true) {
            mail.style.backgroundColor = 'lightyellow';
          }
          else {
            mail.style.backgroundColor = 'white';
          }
          mail.classList.add('container');
          mail.classList.add('mail');
          sender.style.display = 'inline-block';
          sender.style.margin = '1rem';
          sub.style.display = 'inline-block';
          sub.style.margin = '1rem';
          time.style.display = 'inline-block';
          time.style.margin = '1rem';
          time.style.float = 'right';
          time.style.color = 'blue';
          email_view.appendChild(mail);
          mail.appendChild(sender);
          mail.appendChild(sub);
          mail.appendChild(time);
          mail.appendChild(id);
          mail.addEventListener('click', () => load_email());
          sub.addEventListener('click', () => load_email());
          time.addEventListener('click', () => load_email());
          sender.addEventListener('click', () => load_email());
        }
      }
    }
    );
}
function load_email() {
  event.stopImmediatePropagation();
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  mail_view = document.querySelector('#email-view');
  mail_view.style.display = 'block';
  var tar = event.target;
  console.log(tar.children);
  if (!(tar.tagName == 'DIV')) {
    tar = tar.parentElement;
  }
  var c = tar.children;
  var id = c[3].innerHTML;
  mail_view.innerHTML = '';
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      var div = document.createElement('div');
      div.classList.add('container');
      div.classList.add('jumbotron');
      var sub = document.createElement('h3');
      sub.innerText = email['subject'];
      var sender = document.createElement('h5');
      sender.innerText = `From: ${email['sender']}`;
      var body = document.createElement('p');
      body.innerText = email['body'];
      var time = document.createElement('p');
      time.innerText = email['timestamp'];
      time.style.color = 'blue';
      body.style.padding = '2rem';
      body.style.backgroundColor = 'lightgray';
      div.appendChild(sub);
      div.appendChild(sender);
      div.appendChild(time);
      mail_view.appendChild(div);
      mail_view.appendChild(body);
      if (email['read'] == false) {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }
      var archive = email['archived'];
      var btn = document.createElement('button');
      var reply = document.createElement('button');
      if (archive) {
        btn.innerText = 'Unarchive';
      }
      else {
        btn.innerText = 'Archive';
      }
      reply.innerText = 'Reply';
      btn.classList.add('btn-primary');
      btn.classList.add('btn');
      reply.classList.add('btn-primary');
      reply.classList.add('btn');
      btn.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !archive
          })
        });
        load_mailbox('inbox');
      });
      reply.addEventListener('click', () => {
        compose_email();
        document.querySelector('#compose-recipients').value = email['sender'];
        document.querySelector('#compose-body').value = `On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}`;
        if (email['subject'].search('Re:')) {
          document.querySelector('#compose-subject').value = email['subject'];
        }
        else {
          document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
        }
      });
      mail_view.appendChild(btn);
      mail_view.appendChild(reply);
    });
}