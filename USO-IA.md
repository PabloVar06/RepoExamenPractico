# Uso de IA

**Herramientas utilizadas:** ChatGPT (OpenAI) como apoyo para identificar errores, analizar código y proponer soluciones en el frontend y backend.

**Solicitudes representativas:**
- "Revisa el frontend y backend para identificar por qué no se pueden editar los avistamientos y por qué se muestra el ID de la criatura en lugar de su nombre".
- "Analiza por qué la API permite actualizar criaturas con tipos inválidos y cómo corregir las validaciones de Mongoose".

**Decisión técnica:** Acepté las soluciones propuestas después de revisar su funcionamiento. Corregí el nombre del campo `criatura` en el frontend (B-01), incorporé `populate()` para recuperar el nombre de la criatura (B-02), agregué `runValidators: true` para validar las actualizaciones en MongoDB (B-03) y ajusté las dependencias de `useEffect()` para actualizar automáticamente los filtros (B-04). Se priorizaron cambios puntuales que mantuvieran la estructura y las validaciones existentes del proyecto.

**Verificación:** Utilicé Thunder Client para probar peticiones HTTP y comprobar los códigos de respuesta, especialmente las actualizaciones con valores válidos e inválidos. También realicé pruebas desde la interfaz para revisar la edición, visualización de detalles y filtrado de avistamientos, comprobando el comportamiento después de aplicar las correcciones.