# Góndola de Vino

Este proyecto es un ecommerce dedicado a la venta de vinos.  
El sitio permitirá a los usuarios explorar distintas variedades de vinos, conocer sus características y realizar compras en línea.

El objetivo del proyecto es aplicar los conocimientos del curso de Front-End para crear una página web con una estructura completa y funcional

## Estructura principal

- **Header:** contiene el logo y el nombre del sitio.
- **Nav:** incluye enlaces a las secciones principales (Inicio, Catálogo, Nosotros, Contacto y Carrito).
- **Main:** muestra los productos destacados y la información principal.
- **Footer:** contiene los datos de contacto y redes sociales.

## Formulario de contacto

Se agrego un formulario dentro del `<main>` usando Formspree (https://formspree.io) para permitir que los usuarios envíen mensajes directamente desde la web.

### Configuración:

1. Se creó una cuenta gratuita en Formspree.
2. Se obtuvo la URL del formulario
3. Se utilizó el método `POST` y los campos `nombre`, `email` y `mensaje`.

### ¿Por que es útil?

Formspree permite recibir los datos del formulario sin necesidad de configurar un servidor o usar un lenguaje de backend.  
Es una herramienta práctica para proyectos iniciales en HTML.
