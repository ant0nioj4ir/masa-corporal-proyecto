document.addEventListener('DOMContentLoaded', function() {
    // Cargar registros al iniciar
    cargarRegistros();
    
    // Event listeners
    document.getElementById('calcular-btn').addEventListener('click', calcularYGuardarIMC);
    document.getElementById('limpiar-registros').addEventListener('click', limpiarRegistros);
    document.getElementById('exportar-btn').addEventListener('click', exportarCSV);
});

// Variables
let registros = JSON.parse(localStorage.getItem('imcRegistros')) || [];

// Función principal
function calcularYGuardarIMC() {
    // Validar formulario
    if (!validarFormulario()) return;
    
    // Obtener valores
    const nombre = document.getElementById('nombre').value.trim();
    const genero = document.querySelector('input[name="genero"]:checked').value;
    const edad = parseInt(document.getElementById('edad').value);
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseInt(document.getElementById('altura').value);
    
    // Calcular IMC
    const alturaMetros = altura / 100;
    const imc = peso / (alturaMetros * alturaMetros);
    
    // Determinar categoría
    const { categoria, claseCss } = determinarCategoriaIMC(edad, genero, imc);
    
    // Calcular peso ideal
    const pesoIdeal = calcularPesoIdeal(genero, altura, edad);
    
    // Crear registro
    const registro = {
        id: Date.now(),
        nombre,
        genero,
        edad,
        peso,
        altura,
        imc: imc.toFixed(2),
        categoria,
        pesoIdeal: pesoIdeal.toFixed(1),
        fecha: new Date().toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Guardar y mostrar
    guardarRegistro(registro);
    mostrarResultado(registro, claseCss);
    resetFormulario();
}

// Función para validar formulario
function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const edad = document.getElementById('edad').value;
    const peso = document.getElementById('peso').value;
    const altura = document.getElementById('altura').value;
    
    if (!nombre) {
        alert("Por favor ingrese su nombre");
        return false;
    }
    
    if (!edad || edad < 0 || edad > 120) {
        alert("Por favor ingrese una edad válida (0-120 años)");
        return false;
    }
    
    if (!peso || peso <= 0 || peso > 300) {
        alert("Por favor ingrese un peso válido (1-300 kg)");
        return false;
    }
    
    if (!altura || altura < 30 || altura > 250) {
        alert("Por favor ingrese una altura válida (30-250 cm)");
        return false;
    }
    
    return true;
}

// Función para determinar categoría IMC
function determinarCategoriaIMC(edad, genero, imc) {
    let categoria = "", claseCss = "";
    
    if (edad < 18) {
        // Lógica para niños/adolescentes
        if (imc < percentilIMCInfantil(edad, genero, 5)) {
            categoria = "Bajo peso (percentil <5)";
            claseCss = "bajo-peso";
        } else if (imc < percentilIMCInfantil(edad, genero, 85)) {
            categoria = "Peso normal (percentil 5-85)";
            claseCss = "normal";
        } else if (imc < percentilIMCInfantil(edad, genero, 95)) {
            categoria = "Sobrepeso (percentil 85-95)";
            claseCss = "sobrepeso";
        } else {
            categoria = "Obesidad (percentil ≥95)";
            claseCss = "obesidad";
        }
    } else {
        // Lógica para adultos
        if (imc < 18.5) {
            categoria = "Bajo peso";
            claseCss = "bajo-peso";
        } else if (imc < 25) {
            categoria = "Peso normal";
            claseCss = "normal";
        } else if (imc < 30) {
            categoria = "Sobrepeso";
            claseCss = "sobrepeso";
        } else if (imc < 35) {
            categoria = "Obesidad grado I";
            claseCss = "obesidad";
        } else if (imc < 40) {
            categoria = "Obesidad grado II";
            claseCss = "obesidad";
        } else {
            categoria = "Obesidad grado III (mórbida)";
            claseCss = "obesidad";
        }
    }
    
    return { categoria, claseCss };
}

// Función para calcular peso ideal
function calcularPesoIdeal(genero, altura, edad) {
    let pesoIdeal;
    
    if (genero === "masculino") {
        pesoIdeal = 50 + 0.9 * (altura - 152);
    } else {
        pesoIdeal = 45.5 + 0.9 * (altura - 152);
    }
    
    // Ajuste por edad
    if (edad > 50) {
        pesoIdeal *= 1.02;
    } else if (edad < 18) {
        pesoIdeal = percentilPesoInfantil(edad, genero, altura);
    }
    
    return pesoIdeal;
}

// Funciones para percentiles infantiles (simplificadas)
function percentilIMCInfantil(edad, genero, percentil) {
    // Valores de ejemplo - en una app real usar tablas OMS/CDC
    const base = genero === "masculino" ? 16 : 15;
    return base + (edad * 0.2) + (percentil * 0.1);
}

function percentilPesoInfantil(edad, genero, altura) {
    const factor = genero === "masculino" ? 1.1 : 1.0;
    return (edad * 2.3 + 4) * factor * (altura / 100);
}

// Funciones para manejar registros
function guardarRegistro(registro) {
    registros.unshift(registro);
    localStorage.setItem('imcRegistros', JSON.stringify(registros));
    cargarRegistros();
}

function cargarRegistros() {
    const listaRegistros = document.getElementById('lista-registros');
    listaRegistros.innerHTML = '';
    
    if (registros.length === 0) {
        listaRegistros.innerHTML = '<p class="no-registros">No hay registros almacenados.</p>';
        return;
    }
    
    registros.forEach(registro => {
        const registroElement = document.createElement('div');
        registroElement.className = 'registro-item';
        
        // Determinar clase CSS según categoría
        let categoriaClass = '';
        if (registro.categoria.includes("Bajo peso")) categoriaClass = 'bajo-peso';
        else if (registro.categoria.includes("normal")) categoriaClass = 'normal';
        else if (registro.categoria.includes("Sobrepeso")) categoriaClass = 'sobrepeso';
        else categoriaClass = 'obesidad';
        
        registroElement.innerHTML = `
            <div class="registro-header">
                <span class="registro-nombre">${registro.nombre}</span>
                <span class="registro-fecha">${registro.fecha}</span>
            </div>
            <div class="registro-datos">
                <p><strong>Edad:</strong> ${registro.edad} años</p>
                <p><strong>Género:</strong> ${registro.genero === 'masculino' ? 'Hombre' : 'Mujer'}</p>
                <p><strong>Peso:</strong> ${registro.peso} kg</p>
                <p><strong>Altura:</strong> ${registro.altura} cm</p>
                <p><strong>IMC:</strong> ${registro.imc}</p>
                <p><strong>Categoría:</strong> <span class="${categoriaClass}">${registro.categoria}</span></p>
            </div>
            <button class="delete-btn" onclick="eliminarRegistro(${registro.id})">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        `;
        
        listaRegistros.appendChild(registroElement);
    });
}

function eliminarRegistro(id) {
    if (confirm('¿Está seguro que desea eliminar este registro?')) {
        registros = registros.filter(registro => registro.id !== id);
        localStorage.setItem('imcRegistros', JSON.stringify(registros));
        cargarRegistros();
    }
}

function limpiarRegistros() {
    if (confirm('¿Está seguro que desea eliminar TODOS los registros? Esta acción no se puede deshacer.')) {
        registros = [];
        localStorage.removeItem('imcRegistros');
        cargarRegistros();
    }
}

function exportarCSV() {
    if (registros.length === 0) {
        alert("No hay registros para exportar");
        return;
    }
    
    // Crear cabeceras CSV
    let csv = "Nombre,Genero,Edad,Peso (kg),Altura (cm),IMC,Categoria,Peso Ideal (kg),Fecha\n";
    
    // Añadir datos
    registros.forEach(registro => {
        csv += `"${registro.nombre}",${registro.genero},${registro.edad},${registro.peso},${registro.altura},${registro.imc},"${registro.categoria}",${registro.pesoIdeal},"${registro.fecha}"\n`;
    });
    
    // Crear archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registros_imc_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función para mostrar resultados
function mostrarResultado(registro, claseCss) {
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML = `
        <h2>Resultado para ${registro.nombre}</h2>
        <p><strong>Edad:</strong> ${registro.edad} años</p>
        <p><strong>Género:</strong> ${registro.genero === 'masculino' ? 'Hombre' : 'Mujer'}</p>
        <p><strong>Peso actual:</strong> ${registro.peso} kg</p>
        <p><strong>Altura:</strong> ${registro.altura} cm</p>
        <p><strong>IMC:</strong> ${registro.imc}</p>
        <p><strong>Categoría:</strong> ${registro.categoria}</p>
        
        <div class="info-box">
            <h3>Peso ideal estimado:</h3>
            <p>Para su altura (${registro.altura} cm), género (${registro.genero === 'masculino' ? 'hombre' : 'mujer'}) y edad (${registro.edad} años):</p>
            <p><strong>${registro.pesoIdeal} kg</strong> (rango saludable: ${(registro.pesoIdeal*0.95).toFixed(1)} - ${(registro.pesoIdeal*1.05).toFixed(1)} kg)</p>
        </div>
        
        <div class="info-box">
            <h3>Recomendaciones:</h3>
            ${obtenerRecomendaciones(registro.categoria, registro.edad)}
        </div>
    `;
    
    resultDiv.className = claseCss;
    resultDiv.style.display = 'block';
}

function obtenerRecomendaciones(categoria, edad) {
    let recomendaciones = "";
    
    if (categoria.includes("Bajo peso")) {
        if (edad < 18) {
            recomendaciones = "Consulta pediátrica recomendada. El bajo peso en menores puede afectar el desarrollo.";
        } else {
            recomendaciones = "Consulte con un nutricionista para un plan de alimentación que promueva aumento de peso saludable.";
        }
    } else if (categoria.includes("normal")) {
        recomendaciones = "¡Mantenga sus buenos hábitos! Siga una dieta balanceada y realice actividad física regular.";
    } else if (categoria.includes("Sobrepeso")) {
        recomendaciones = "Considere aumentar actividad física y ajustar su dieta. Pequeños cambios pueden hacer gran diferencia.";
    } else {
        recomendaciones = "Consulta médica recomendada. La obesidad aumenta riesgo de problemas de salud importantes.";
    }
    
    if (edad >= 50) {
        recomendaciones += " En adultos mayores, es importante mantener masa muscular con ejercicio y proteínas adecuadas.";
    }
    
    return `<p>${recomendaciones}</p>`;
}

// Función para resetear formulario
function resetFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('edad').value = '';
    document.getElementById('peso').value = '';
    document.getElementById('altura').value = '';
}

// Función para cambiar pestañas
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}