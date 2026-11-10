(function(){
  'use strict';

  var burger=document.getElementById('burger');
  var menu=document.getElementById('menu');

  function cerrarMenu(){
    if(!burger||!menu)return;
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
  }

  if(burger&&menu){
    burger.addEventListener('click',function(){
      var abierto=menu.classList.toggle('open');
      burger.setAttribute('aria-expanded',String(abierto));
    });
    menu.querySelectorAll('a').forEach(function(enlace){
      enlace.addEventListener('click',cerrarMenu);
    });
    document.addEventListener('keydown',function(evento){
      if(evento.key==='Escape')cerrarMenu();
    });
    window.addEventListener('resize',function(){
      if(window.innerWidth>960)cerrarMenu();
    });
  }

  // Festivos de Colombia 2026-2030 (Ley Emiliani y Semana Santa).
  var FESTIVOS=['2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01','2026-05-18','2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07','2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25','2027-01-01','2027-01-11','2027-03-22','2027-03-25','2027-03-26','2027-05-01','2027-05-10','2027-05-31','2027-06-07','2027-07-05','2027-07-20','2027-08-07','2027-08-16','2027-10-18','2027-11-01','2027-11-15','2027-12-08','2027-12-25','2028-01-01','2028-01-10','2028-03-20','2028-04-13','2028-04-14','2028-05-01','2028-05-29','2028-06-19','2028-06-26','2028-07-03','2028-07-20','2028-08-07','2028-08-21','2028-10-16','2028-11-06','2028-11-13','2028-12-08','2028-12-25','2029-01-01','2029-01-08','2029-03-19','2029-03-29','2029-03-30','2029-05-01','2029-05-14','2029-06-04','2029-06-11','2029-07-02','2029-07-20','2029-08-07','2029-08-20','2029-10-15','2029-11-05','2029-11-12','2029-12-08','2029-12-25','2030-01-01','2030-01-07','2030-03-25','2030-04-18','2030-04-19','2030-05-01','2030-06-03','2030-06-24','2030-07-01','2030-07-01','2030-07-20','2030-08-07','2030-08-19','2030-10-14','2030-11-04','2030-11-11','2030-12-08','2030-12-25'];

  // Estado de atención calculado con la hora oficial de Colombia.
  function actualizarEstado(){
    var partes=new Intl.DateTimeFormat('en-US',{
      timeZone:'America/Bogota',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'numeric',minute:'numeric',hour12:false
    }).formatToParts(new Date());
    var datos={};
    partes.forEach(function(parte){datos[parte.type]=parte.value;});
    var dias={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    var dia=dias[datos.weekday];
    var hora=(parseInt(datos.hour,10)%24)+parseInt(datos.minute,10)/60;
    var fecha=datos.year+'-'+datos.month+'-'+datos.day;
    var festivo=FESTIVOS.indexOf(fecha)!==-1;
    if(festivo)dia=0;
    var abierto=(dia>=1&&dia<=5&&hora>=8&&hora<18)||(dia===6&&hora>=8&&hora<12);
    var texto=abierto?'Estamos atendiendo ahora':(festivo?'Hoy es festivo: sin atención':'Fuera de horario de atención');

    ['estado','estado-top'].forEach(function(id){
      var elemento=document.getElementById(id);
      if(elemento){
        elemento.classList.toggle('on',abierto);
        var etiqueta=elemento.querySelector('span');
        if(etiqueta)etiqueta.textContent=texto;
      }
    });
    document.querySelectorAll('#filas .row').forEach(function(fila){
      var diasFila=(fila.dataset.d||'').split(',');
      fila.classList.toggle('today',diasFila.indexOf(String(dia))!==-1);
    });
  }

  actualizarEstado();
  window.setInterval(actualizarEstado,60000);

  // Formulario: envía la consulta al correo de EduPrime (FormSubmit); si falla, abre el correo del usuario.
  var formulario=document.getElementById('form-consulta');
  if(formulario){
    formulario.addEventListener('submit',function(evento){
      evento.preventDefault();
      var nombre=document.getElementById('f-nombre').value.trim();
      var correo=document.getElementById('f-correo').value.trim();
      var tipo=document.getElementById('f-tipo').value;
      var mensaje=document.getElementById('f-msg').value.trim();
      var salida=document.getElementById('msg');

      if(!formulario.reportValidity())return;
      if(nombre.length<3||mensaje.length<10){
        salida.className='error';
        salida.textContent='Revisa los datos: el nombre debe tener al menos 3 caracteres y el mensaje 10.';
        return;
      }

      var boton=document.getElementById('enviar');
      var asuntoTxt='Consulta EduPrime: '+tipo;
      boton.disabled=true;
      salida.className='';
      salida.textContent='Enviando tu consulta…';

      function respaldo(){
        var cuerpo=encodeURIComponent('Nombre: '+nombre+'\nCorreo: '+correo+'\nTipo de consulta: '+tipo+'\n\nMensaje:\n'+mensaje);
        salida.className='error';
        salida.textContent='No pudimos enviarla automáticamente. Abriendo tu correo para que la envíes desde allí…';
        window.location.href='mailto:eduprime.aa3@gmail.com?subject='+encodeURIComponent(asuntoTxt)+'&body='+cuerpo;
      }

      fetch('https://formsubmit.co/ajax/eduprime.aa3@gmail.com',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({
          'Nombre':nombre,'Correo':correo,'Tipo de consulta':tipo,'Mensaje':mensaje,
          _subject:asuntoTxt,_replyto:correo,_template:'table',_captcha:'false',_honey:''
        })
      }).then(function(r){return r.json();}).then(function(d){
        if(d&&(d.success===true||d.success==='true')){
          salida.className='success';
          salida.textContent='¡Listo! Recibimos tu consulta y te responderemos en máximo 2 días hábiles.';
          formulario.reset();
        }else{respaldo();}
      }).catch(respaldo).then(function(){boton.disabled=false;});
    });
  }

  // Aparición suave al desplazarse. El contenido sigue visible si no hay soporte.
  var elementos=document.querySelectorAll(
    '.hero .wrap>div,.hero .ficha,.quick .card,main section,.pagehead .wrap,footer .fgrid>div,.stagger>*'
  );
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.body.classList.add('reveal-ready');
    elementos.forEach(function(elemento){elemento.setAttribute('data-reveal','');});
    document.querySelectorAll('.stagger').forEach(function(g){Array.prototype.forEach.call(g.children,function(h,i){h.style.transitionDelay=(i%3)*90+'ms';});});
    var observador=new IntersectionObserver(function(entradas,obs){
      entradas.forEach(function(entrada){
        if(entrada.isIntersecting){
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        }
      });
    },{threshold:0.12});
    elementos.forEach(function(elemento){observador.observe(elemento);});
  }

  // Barra de progreso de lectura y botón de volver arriba.
  var progreso=document.getElementById('progreso');
  var arriba=document.getElementById('a-top');
  function alDesplazar(){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    var y=window.pageYOffset||document.documentElement.scrollTop;
    if(progreso)progreso.style.transform='scaleX('+(max>0?Math.min(y/max,1):0)+')';
    if(arriba)arriba.classList.toggle('show',y>600);
  }
  window.addEventListener('scroll',alDesplazar,{passive:true});
  alDesplazar();
  if(arriba)arriba.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

  // Contadores animados.
  var contadores=document.querySelectorAll('[data-count]');
  function contar(el){
    var meta=parseInt(el.getAttribute('data-count'),10);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=meta;return;}
    var t0=null;
    function paso(t){
      if(t0===null)t0=t;
      var p=Math.min((t-t0)/1100,1);
      el.textContent=Math.round(meta*(1-Math.pow(1-p,3)));
      if(p<1)window.requestAnimationFrame(paso);
    }
    window.requestAnimationFrame(paso);
  }
  if('IntersectionObserver' in window){
    var obsC=new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){contar(e.target);o.unobserve(e.target);}});},{threshold:0.6});
    contadores.forEach(function(c){obsC.observe(c);});
  }
})();
