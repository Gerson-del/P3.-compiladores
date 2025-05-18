function procesar() {
  const input = document.getElementById("inputProducciones").value.trim();
  ObjetoProducciones = {};
  primero = {};
  siguiente = {};
  tabla = {};

  // Tomamos las ObjetoProducciones de textArea y las leemos
  const lineas = input.split("\n");
  lineas.forEach((linea) => {
    const [izq, der] = linea.split("->").map((x) => x.trim());
    ObjetoProducciones[izq] = der
      .split("|")
      .map((prod) => prod.trim().split(" "));
  });

  // los diccionarios primero y siguiente los inicializamos vacios
  for (let nt in ObjetoProducciones) {
    primero[nt] = [];
    siguiente[nt] = [];
  }

  // Aqui se calcula el primero usando la funcion CalcularPrimero()
  for (let nt in ObjetoProducciones) {
    calcularPrimero(nt);
  }

  // se añade $ al conjunto siguiente del primer simbolo
  const inicial = Object.keys(ObjetoProducciones)[0];
  siguiente[inicial].push("$");

  let cambio = true;
  while (cambio) {
    cambio = false;
    for (let nt in ObjetoProducciones) {
      ObjetoProducciones[nt].forEach((prod) => {
        for (let i = 0; i < prod.length; i++) {
          let simbolo = prod[i];
          if (ObjetoProducciones[simbolo]) {
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

  // Esto construye la tabla predictiva
  for (let nt in ObjetoProducciones) {
    tabla[nt] = {};
    ObjetoProducciones[nt].forEach((prod) => {
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

  document.getElementById("primero").innerText = formatear(primero);
  document.getElementById("siguiente").innerText = formatear(siguiente);
  mostrarTabla();
}

function calcularPrimero(nt) {
  ObjetoProducciones[nt].forEach((prod) => {
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
  return !ObjetoProducciones[s] && s !== "ε";
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
