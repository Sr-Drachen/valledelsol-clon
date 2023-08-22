let hotspotsXML = [];
let currentHotspotId = "";
let suptotal = "";
let servidumbre = "";
let supparcial = "";

const token = getCookie('jwt') || 'logout';
let isJWTToken = true;

const optionsPUT = { 
  method: 'PUT',
  headers: {
   'Content-Type': 'application/json',
    authorization: `Bearer ${token}`,
  },
  body: {},
};

const url = `${window.location.origin}/api/admin`;

const form = document.querySelector('#admin-form');

var invalidDescriptionDiv = document.getElementById("invalidDescriptionDiv");

(() => {
  const tablaDatos = document.querySelector('#tablaDatos');
  const logoutButton = document.querySelector('#logoutButton');

  const optionsGET = {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  
  function generateTable(data) {
    const table = document.createElement('table');
    table.className = 'table';

    // Crea la cabecera de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
      'Parcela',
      'Estado',
      'Info de Ficha',
    ];

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.classList.add('header-table')
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Crea las filas de datos
    const tbody = document.createElement('tbody');
    tbody.classList.add('body-table');
    data.forEach((hotspot) => {
      const row = document.createElement('tr');
      row.classList.add('tr-info');
      const idCell = document.createElement('td');
      idCell.classList.add('td-spots');
      idCell.textContent = `Lote ${hotspot.title}`;
      row.appendChild(idCell);


      const statusCell = document.createElement('td');
      if (hotspot.skinid === 'ht_disponible') {
        statusCell.textContent = 'Reservado';
      } else if (hotspot.skinid === 'ht_noDisponible') {
        statusCell.textContent = 'Vendido';
      }
      row.appendChild(statusCell);

      const descriptionCell = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.textContent = "Editar";
      editButton.classList.add('btn', 'btn-primary', 'btn-editar');
      editButton.dataset.hotspotId = `Lote ${hotspot.title}`;
      editButton.dataset.id = hotspot.id;
      // editButton.dataset.description =  `${hotspot.info.description.replace(/m²/g, 'm²\n')}Precio: ${hotspot.info.info}`;
      let descriptionObject = getVarsFromDescription(hotspot.info.description)
      editButton.dataset.suptotal = descriptionObject.suptotal;
      editButton.dataset.servidumbre = descriptionObject.servidumbre;
      editButton.dataset.supparcial = descriptionObject.supparcial;
      editButton.dataset.info = hotspot.info.info;
      editButton.dataset.estado = hotspot.skinid;
      editButton.onclick = openModalWithHotspotId;
      descriptionCell.appendChild(editButton);
      row.appendChild(descriptionCell);

      tbody.appendChild(row);

     
    });

    table.appendChild(tbody);
    tablaDatos.appendChild(table);

    logoutButton.addEventListener('click', () => {
      document.cookie = 'jwt=logout';
      replacePage();
    });

    const replacePage = () => {
      history.replaceState(null, null, 'loginForm.html');
      location.href = `${window.location.origin}/loginForm.html`;
    };
  }

  async function fetchData() {
    try {
      const response = await fetch(url, optionsGET);
      if (response.ok) {
        const data = await response.json();
        hotspotsXML = data.hotspots;
        generateTable(hotspotsXML);
      } else {
        // Handle error response
        console.error('Error:', response.status, response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error('Fetch Error:', error);
    }
  }

  fetchData();

})();

    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    var modal = document.getElementById("myModal");

    function openModal() {
      modal.style.display = "block";
    }

    function closeModal() {
      modal.style.display = "none";
    }   

  function openModalWithHotspotId(event) {
    invalidDescriptionDiv.style.display = "none";
    const hotspotId = event.target.dataset.hotspotId;
    const hotspotDescription = event.target.dataset.description;
    const hotspotInfo = event.target.dataset.info;
    const nameInput = document.getElementById("nameInput");
    const descriptionInput = document.getElementById("descriptionTextarea");
    const estadoInput = document.getElementById("status")
    const precioInput = document.getElementById("precioInput")
    const suptotalInput = document.getElementById("suptotalInput")
    const servidumbreInput = document.getElementById("servidumbreInput")
    const supparcialInput = document.getElementById("supparcialInput");
    currentHotspotId = event.target.dataset.id;
    precioInput.value = hotspotInfo;
    nameInput.value = hotspotId;
    // descriptionInput.value = hotspotDescription.replace(/<[^>]+>/g, '');
    estadoInput.value = event.target.dataset.estado;
    suptotalInput.value = event.target.dataset.suptotal;
    servidumbreInput.value = event.target.dataset.servidumbre;
    supparcialInput.value = event.target.dataset.supparcial;
    openModal();
  }

  function getVarsFromDescription(description){
    const regex = /<b>Sup\. Total:<\/b>\s*([\d\.,]+) m²<br><b>Servidumbre:<\/b>\s*([\d\.,]+) m²<br><b>Sup\. Parcial:<\/b>\s*([\d\.,]+) m²<br>/;
    const matches = description.match(regex);
  
    if (matches && matches.length === 4) {
      suptotal = matches[1].trim();
      servidumbre = matches[2].trim();
      supparcial = matches[3].trim();
    }

    return {
      suptotal,
      servidumbre,
      supparcial
    }
  } 

  function saveChanges() {
    var name = document.getElementById("nameInput").value;
    var status = document.getElementById("status").value;
    const hotspot = hotspotsXML.find((hotspot) => hotspot.id === currentHotspotId);
    
    if (hotspot) {
        hotspot.skinid = status;
        hotspot.name = name;
    }

    if (token !== 'logout' && isJWTToken) {

      const values = getAllFormValues();
      
      if (values) {
        
        optionsPUT.body = JSON.stringify(values);
        console.log("matches: ");
        console.log(optionsPUT.body);
        
        fetch(url, optionsPUT)
          .then((response) => {
              location.reload();
              return response.json();
            })
            .then(() => cleanInputs())
            .catch((error) => {
              console.error(error);
            });
    
            closeModal();
      }
    }
  }

  const getAllFormValues = () => {
    // const inputTextArea = document.getElementById("descriptionTextarea");
    const suptotalInput = document.getElementById("suptotalInput");
    const servidumbreInput = document.getElementById("servidumbreInput");
    const supparcialInput = document.getElementById("supparcialInput");
    const price = document.getElementById("precioInput");
    // const editedText = inputTextArea.value;
  
    // Extraer los valores modificados de las variables
    // const regex = /Sup\. Total: ([\d\.,]+) m²\nServidumbre: ([\d\.,]+) m²\nSup\. Parcial: ([\d\.,]+) m²\nPrecio: (.*)/;
    // const matches = editedText.match(regex);
  
    //   invalidDescriptionDiv.style.display = "none";
      const supTotal = suptotalInput.value;
      const servidumbre = servidumbreInput.value;
      const supParcial = supparcialInput.value;
      const info = price.value;
      
      const loteId = currentHotspotId;
      const status = document.getElementById('status').value === 'ht_disponible' ? true : false;
      const description = 
        `<b>Sup. Total:</b> ${supTotal} m²<br><b>Servidumbre:</b> ${servidumbre} m²<br><b>Sup. Parcial:</b> ${supParcial} m²<br>`;
      return {
        lotId: loteId,
        status,
        description,
        info // precio
      };
  };

  // Esto no sirve que alguien lo arregle para mostrar otro tipo de mensaje (Opcional)
  const responseAlertCreate = (message, error = false) => {
    const responseAlert = document.createElement('div');
    responseAlert.className = `alert ${
      error ? 'alert-danger' : 'alert-primary'
    }`;
    responseAlert.innerHTML = message;
    form.prepend(responseAlert);

    setTimeout(() => {
      responseAlert.remove();
    }, 2300);
  };


// CODIGO ANTIGUO
      
// (() => {
//   const price = document.querySelector('#price');
//   const hotspotsSelect = document.querySelector('#loteId');
//   const form = document.querySelector('#admin-form');
//   const logoutButton = document.querySelector('#logoutButton');

//   let hotspotsXML = [];
//   const url = `${window.location.origin}/api/admin`;

//   const token = getCookie('jwt') || 'logout';
//   let isJWTToken = true;

//   const optionsGET = {
//     method: 'GET',
//     headers: {
//       authorization: `Bearer ${token}`,
//     },
//   };

//   const optionsPUT = {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       authorization: `Bearer ${token}`,
//     },
//     body: {},
//   };

//   const formatNumber = () => {
//     let price = document.getElementById('price');
//     let num = price.value.replace(/\./g, '');
//     if (num === '') {
//       price.value = '';
//     } else if (/^\d+$/.test(num)) {
//       price.value = parseInt(num).toLocaleString('es-ES');
//     } else {
//       let digits = num.match(/\d+/g);
//       price.value = digits ? digits.join('') : '';
//       alert('Ingrese solo números');
//     }
//   };

//   function changeDisponibility() {
//     const loteId = this.value;
//     const hotspot = hotspotsXML.find((hotspot) => hotspot.id === loteId);

//     if (!hotspot) document.getElementById('status').checked = false;

//     if (hotspot) {
//       document.getElementById('status').checked =
//         hotspot.skinid === 'ht_disponible' ? true : false;
//     }

//     if (hotspot?.info?.info) {
//       if (hotspot.info.info[0] === '$') {
//         const priceLength = hotspot.info.info.length;
//         hotspot.info.info = hotspot.info.info.substring(1, priceLength);
//       }
//       document.getElementById('price').value = hotspot.info.info;
//     } else {
//       document.getElementById('price').value = 0;
//     }
//   }

//   function getCookie(name) {
//     const cookies = document.cookie.split(';');
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.startsWith(name + '=')) {
//         return cookie.substring(name.length + 1);
//       }
//     }
//     return '';
//   }

//   const getAllFormValues = () => {
//     const loteId = document.getElementById('loteId').value;
//     // const title = document.getElementById('title').value;
//     // const surface = document.getElementById('surface').value;
//     const price = document.getElementById('price').value;
//     const status = document.getElementById('status').checked;
//     // const description = document.getElementById('description').value;

//     return {
//       lotId: loteId,
//       status,
//       info: `$${price}`,
//     };
//   };

//   const cleanInputs = () => {
//     document.getElementById('loteId').value = '';
//     document.getElementById('title').value = '';
//     document.getElementById('surface').value = '';
//     document.getElementById('price').value = '';
//     document.getElementById('status').checked = false;
//     document.getElementById('description').value = '';
//   };

//   const replacePage = () => {
//     history.replaceState(null, null, 'loginForm.html');
//     location.href = `${window.location.origin}/loginForm.html`;
//   };

//   const responseAlertCreate = (message, error = false) => {
//     const responseAlert = document.createElement('div');
//     responseAlert.className = `alert ${
//       error ? 'alert-danger' : 'alert-primary'
//     }`;
//     responseAlert.innerHTML = message;
//     form.prepend(responseAlert);

//     setTimeout(() => {
//       responseAlert.remove();
//     }, 2300);
//   };

//   fetch(`${window.location.origin}/api/login/verify`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ token }),
//   })
//     .then((response) => response.json())
//     .then(({ isValidToken }) => {
//       isJWTToken = isValidToken;
//     })
//     .catch((error) => console.error(error));

//   logoutButton.addEventListener('click', () => {
//     document.cookie = 'jwt=logout';
//     replacePage();
//   });

//   if (token !== 'logout' && isJWTToken) {
//     price.addEventListener('blur', formatNumber);

//     hotspotsSelect.addEventListener('change', changeDisponibility);

//     form.addEventListener('submit', (e) => {
//       e.preventDefault();

//       const values = getAllFormValues();

//       optionsPUT.body = JSON.stringify(values);

//       fetch(url, optionsPUT)
//         .then((response) => {
//           responseAlertCreate('Actualización Exitosa');

//           return response.json();
//         })
//         .then(() => cleanInputs())
//         .catch((error) => {
//           responseAlertCreate(
//             'Ocurrio un error, por favor intentelo en unos minutos',
//             true
//           );
//           console.error(error);
//         });
//     });

//     fetch(url, optionsGET)
//       .then((response) => response.json())
//       .then(({ hotspots }) => {
//         // Crea un option para cada hotspot
//         hotspotsXML = hotspots;

//         hotspots.forEach((hotspot) => {
//           const option = document.createElement('option');
//           option.value = hotspot.id;
//           option.textContent = hotspot.id;
//           hotspotsSelect.appendChild(option);
//         });
//       })
//       .catch((error) => console.error(error));
//   } else {
//     replacePage();
//   }
// })();