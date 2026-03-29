/* Page logic for contacto.html — extracted from inline script */
(function(){
          var COOLDOWN = 60;
          var form = document.getElementById('contactForm');
          var btn  = document.getElementById('contactSubmit');
          var msg  = document.getElementById('antispam-msg');
          var cdEl = document.getElementById('antispam-countdown');
          var timer = null;

          var lastSent = parseInt(sessionStorage.getItem('mm_last_sent') || '0');
          var elapsed  = Math.floor((Date.now() - lastSent) / 1000);
          if (lastSent && elapsed < COOLDOWN) startCooldown(COOLDOWN - elapsed);

          form.addEventListener('submit', function(e) {
            if (document.querySelector('input[name="_honey"]').value !== '') {
              e.preventDefault(); return;
            }
            var ls = parseInt(sessionStorage.getItem('mm_last_sent') || '0');
            var el = Math.floor((Date.now() - ls) / 1000);
            if (ls && el < COOLDOWN) {
              e.preventDefault();
              msg.style.display = 'block';
              cdEl.textContent = COOLDOWN - el;
              return;
            }
            sessionStorage.setItem('mm_last_sent', Date.now().toString());
            startCooldown(COOLDOWN);
          });

          function startCooldown(secs) {
            var rem = secs;
            btn.disabled = true;
            btn.textContent = 'Espera ' + rem + 's...';
            msg.style.display = 'block';
            cdEl.textContent = rem;
            clearInterval(timer);
            timer = setInterval(function() {
              rem--;
              btn.textContent = 'Espera ' + rem + 's...';
              cdEl.textContent = rem;
              if (rem <= 0) {
                clearInterval(timer);
                btn.disabled = false;
                btn.textContent = 'Enviar consulta';
                msg.style.display = 'none';
              }
            }, 1000);
          }
        })();
