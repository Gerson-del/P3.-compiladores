function procesar() {
  const input = document.getElementById("inputProducciones").value.trim();
  producciones = {};
  primero = {};
  siguiente = {};
  tabla = {};

  // Leer producciones desde el textarea
  const lineas = input.split("\n");
  lineas.forEach((linea) => {
    const [izq, der] = linea.split("->").map((x) => x.trim());
    producciones[izq] = der.split("|").map((prod) => prod.trim().split(" "));
  });

  // Inicializar PRIMERO y SIGUIENTE vacíos
  for (let nt in producciones) {
    primero[nt] = [];
    siguiente[nt] = [];
  }

  // Calcular PRIMERO
  for (let nt in producciones) {
    calcularPrimero(nt);
  }

  // Agregar $ al conjunto SIGUIENTE del símbolo inicial
  const inicial = Object.keys(producciones)[0];
  siguiente[inicial].push("$");

  // Calcular SIGUIENTE con propagación
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (let nt in producciones) {
      producciones[nt].forEach((prod) => {
        for (let i = 0; i < prod.length; i++) {
          let simbolo = prod[i];
          if (producciones[simbolo]) {
            // Es no terminal
            let siguientes = [];

            if (i + 1 < prod.length) {
              let siguienteSimbolo = prod[i + 1];
              if (esTerminal(siguienteSimbolo)) {
                siguientes.push(siguienteSimbolo);
              } else {
                siguientes = siguientes.concat(
                  primero[siguienteSimbolo].filter((x) => x !== "ε")
                );
                if (primero[siguienteSimbolo].includes("ε")) {
                  siguientes = siguientes.concat(siguiente[nt]);
                }
              }
            } else {
              siguientes = siguientes.concat(siguiente[nt]);
            }

            siguientes.forEach((s) => {
              if (!siguiente[simbolo].includes(s)) {
                siguiente[simbolo].push(s);
                cambio = true;
              }
            });
          }
        }
      });
    }
  }

  // Construir tabla predictiva
  for (let nt in producciones) {
    tabla[nt] = {};
    producciones[nt].forEach((prod) => {
      let primeros = obtenerPrimeroDe(prod);
      primeros.forEach((t) => {
        if (t !== "ε") tabla[nt][t] = `${nt}->${prod.join(" ")}`;
      });
      if (primeros.includes("ε")) {
        siguiente[nt].forEach((t) => {
          tabla[nt][t] = `${nt}->${prod.join(" ")}`;
        });
      }
    });
  }

  // Mostrar resultados
  document.getElementById("primero").innerText = formatear(primero);
  document.getElementById("siguiente").innerText = formatear(siguiente);
  mostrarTabla();
}

function calcularPrimero(nt) {
  producciones[nt].forEach((prod) => {
    let i = 0;
    let contieneEpsilon = true;
    while (i < prod.length && contieneEpsilon) {
      let simbolo = prod[i];
      if (esTerminal(simbolo)) {
        if (!primero[nt].includes(simbolo)) primero[nt].push(simbolo);
        contieneEpsilon = false;
      } else if (simbolo === "ε") {
        if (!primero[nt].includes("ε")) primero[nt].push("ε");
        contieneEpsilon = false;
      } else {
        if (primero[simbolo].length === 0) calcularPrimero(simbolo);
        primero[simbolo].forEach((s) => {
          if (s !== "ε" && !primero[nt].includes(s)) primero[nt].push(s);
        });
        if (!primero[simbolo].includes("ε")) contieneEpsilon = false;
      }
      i++;
    }
    if (contieneEpsilon) {
      if (!primero[nt].includes("ε")) primero[nt].push("ε");
    }
  });
}

function obtenerPrimeroDe(prod) {
  let primeros = [];
  let i = 0;
  let contieneEpsilon = true;

  while (i < prod.length && contieneEpsilon) {
    let simbolo = prod[i];
    if (esTerminal(simbolo)) {
      primeros.push(simbolo);
      contieneEpsilon = false;
    } else if (simbolo === "ε") {
      primeros.push("ε");
      contieneEpsilon = false;
    } else {
      primero[simbolo].forEach((s) => {
        if (s !== "ε" && !primeros.includes(s)) primeros.push(s);
      });
      if (!primero[simbolo].includes("ε")) contieneEpsilon = false;
    }
    i++;
  }

  if (contieneEpsilon) primeros.push("ε");
  return primeros;
}

function esTerminal(s) {
  return !producciones[s] && s !== "ε";
}

function formatear(obj) {
  let res = "";
  for (let nt in obj) {
    res += `${nt}: { ${obj[nt].join(", ")} }\n`;
  }
  return res;
}

function mostrarTabla() {
  const t = document.getElementById("tabla");
  t.innerHTML = "";

  let terminales = new Set();
  for (let nt in tabla) {
    for (let term in tabla[nt]) terminales.add(term);
  }
  terminales = Array.from(terminales);

  let head = "<thead><tr><th></th>";
  terminales.forEach((t) => (head += `<th>${t}</th>`));
  head += "</tr></thead>";
  t.innerHTML += head;

  let body = "<tbody>";
  for (let nt in tabla) {
    body += `<tr><td>${nt}</td>`;
    terminales.forEach((term) => {
      let val = tabla[nt][term] || "";
      body += `<td>${val}</td>`;
    });
    body += "</tr>";
  }
  body += "</tbody>";

  t.innerHTML += body;
}
