# Gestión de Aseo del Grupo

Aplicación web responsiva para la asignación semanal de turnos de aseo del grupo.

## Estructura del proyecto

```
GESTIONASEODELGRUPO/
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── index.html
└── README.md
```

## Tecnologías usadas

- HTML5 (estructura semántica)
- CSS3 (variables, grid, animaciones, responsive)
- JavaScript ES6+ (arrow functions, módulos, localStorage)

## Cómo ejecutar

Abrir `index.html` directamente en el navegador.

## Funcionalidades

- Rotación justa de los 22 integrantes de lunes a viernes
- Botón para marcar ausencia y asignar reemplazo aleatorio automático
- Persistencia total con localStorage (los datos no se pierden al cerrar)
- Generación de nueva semana respetando el turno actual
- Estadísticas en tiempo real (activos, reemplazos, semana)

## Patrones de diseño aplicados

| Patrón | Módulo | Descripción |
|---|---|---|
| Module Pattern | Todos los módulos | Encapsula estado interno, expone solo API pública |
| Observer Pattern | EventBus | La UI se suscribe y reacciona sin acoplamiento directo |

## Principios SOLID aplicados

| Principio | Aplicación |
|---|---|
| SRP | Cada módulo tiene una única responsabilidad |
| OCP | Se pueden agregar días o miembros sin modificar el núcleo |
| DIP | App depende de EventBus (abstracción), no de módulos concretos |
| ISP | Cada módulo expone solo los métodos que necesita |

## Autores

Grupo — Ingeniería de Sistemas