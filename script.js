document.addEventListener('DOMContentLoaded', () => {
  const feriaForm = document.getElementById('feria-form');
  const emprendimientoForm = document.getElementById('emprendimiento-form');
  const feriaSelect = document.getElementById('emprendimiento-feria');
  const eventosLista = document.getElementById('eventos-lista');

  function cargarFerias() {
    const ferias = JSON.parse(localStorage.getItem('ferias') || '[]');
    return ferias;
  }

  function guardarFerias(ferias) {
    localStorage.setItem('ferias', JSON.stringify(ferias));
  }

  function guardarFeria(feria) {
    const ferias = cargarFerias();
    ferias.push(feria);
    guardarFerias(ferias);
  }

  function actualizarSelectFerias() {
    const ferias = cargarFerias();
    feriaSelect.innerHTML = '';
    ferias.forEach(feria => {
      const option = document.createElement('option');
      option.value = feria.id;
      option.textContent = `${feria.lugar} (${feria.inicio})`;
      feriaSelect.appendChild(option);
    });
  }

  function renderizarFerias() {
    const ferias = cargarFerias();
    ferias.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    eventosLista.innerHTML = '';
    ferias.forEach(feria => {
      const div = document.createElement('div');
      div.className = 'evento';
      div.innerHTML = `<h3>${feria.lugar}</h3>
        <p><b>Fecha:</b> ${feria.inicio} a ${feria.fin}</p>
        <p><b>Horario:</b> ${feria.horario}</p>
        <div><b>Emprendimientos:</b></div>
        <div class="emprendimientos-lista"></div>`;
      const listaEmp = div.querySelector('.emprendimientos-lista');
      if (feria.emprendimientos && feria.emprendimientos.length > 0) {
        feria.emprendimientos.forEach(emp => {
          const empDiv = document.createElement('div');
          empDiv.className = 'emprendimiento';
          empDiv.innerHTML = `<h4>${emp.nombre}</h4>
            <p><b>Categoría:</b> ${emp.categoria}</p>
            <p><b>Descripción:</b> ${emp.descripcion}</p>
            <p><b>Red social:</b> <a href="${emp.red}" target="_blank">${emp.red}</a></p>
            <div><b>Producto/Servicio:</b></div>
            <div class="producto">
              <p><b>Nombre:</b> ${emp.producto.nombre}</p>
              <p><b>Precio:</b> $${parseFloat(emp.producto.precio).toFixed(2)}</p>
              <p><b>Descripción:</b> ${emp.producto.descripcion}</p>
              ${emp.producto.foto ? `<img class="producto-img" src="${emp.producto.foto}" alt="Foto producto">` : ''}
            </div>`;
          listaEmp.appendChild(empDiv);
        });
      } else {
        listaEmp.innerHTML = '<em>No hay emprendimientos registrados.</em>';
      }
      eventosLista.appendChild(div);
    });
  }

  feriaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const lugar = document.getElementById('feria-lugar').value.trim();
    const inicio = document.getElementById('feria-inicio').value;
    const fin = document.getElementById('feria-fin').value;
    const horario = document.getElementById('feria-horario').value.trim();
    if (!lugar || !inicio || !fin || !horario) return;
    const feria = {
      id: Date.now().toString(),
      lugar,
      inicio,
      fin,
      horario,
      emprendimientos: []
    };
    guardarFeria(feria);
    feriaForm.reset();
    actualizarSelectFerias();
    renderizarFerias();
  });

  emprendimientoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const feriaId = feriaSelect.value;
    const nombre = document.getElementById('emprendimiento-nombre').value.trim();
    const categoria = document.getElementById('emprendimiento-categoria').value.trim();
    const descripcion = document.getElementById('emprendimiento-descripcion').value.trim();
    const red = document.getElementById('emprendimiento-red').value.trim();
    const productoNombre = document.getElementById('producto-nombre').value.trim();
    const productoPrecio = document.getElementById('producto-precio').value;
    const productoDescripcion = document.getElementById('producto-descripcion').value.trim();
    const productoFotoInput = document.getElementById('producto-foto');
    if (!feriaId || !nombre || !categoria || !descripcion || !red || !productoNombre || !productoPrecio || !productoDescripcion || !productoFotoInput.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const fotoBase64 = ev.target.result;
      const emprendimiento = {
        nombre,
        categoria,
        descripcion,
        red,
        producto: {
          nombre: productoNombre,
          precio: productoPrecio,
          descripcion: productoDescripcion,
          foto: fotoBase64
        }
      };
      const ferias = cargarFerias();
      const idx = ferias.findIndex(f => f.id === feriaId);
      if (idx !== -1) {
        ferias[idx].emprendimientos = ferias[idx].emprendimientos || [];
        ferias[idx].emprendimientos.push(emprendimiento);
        guardarFerias(ferias);
        emprendimientoForm.reset();
        renderizarFerias();
      }
    };
    reader.readAsDataURL(productoFotoInput.files[0]);
  });

  actualizarSelectFerias();
  renderizarFerias();
}); 