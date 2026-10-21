# Evidencias
Guarda capturas o texto de cliente HTTP/Network/Compass relevantes por reporte y relaciónalas en AUDITORIA.md. No incluir URI, contraseñas, tokens ni datos personales de compañeros.

## B-01 · No se guarda la edición del avistamiento

Al momento de editar un avistamiento y guardar los cambios, aparece el error:

"Campos no permitidos en el cuerpo · petición 3f020ba8-fb03-496f-a39b-565b7c628077"

Esto ocurre porque el frontend envía un campo llamado `criaturaId` al actualizar un avistamiento, mientras que el backend únicamente acepta el campo `criatura`. Como resultado, la validación del backend rechaza la solicitud y no permite guardar los cambios.

**Backend:**

En el archivo `avistamientos.service.ts`, se definen los campos permitidos:

```ts
const campos = [
  'criatura',
  'testigo',
  'ubicacion',
  'descripcion',
  'fecha'
];
```

La función `actualizar()` utiliza la validación `cuerpo()` para comprobar que los datos enviados contengan únicamente los campos permitidos.

**Frontend:**

En el archivo `FormularioAvistamiento.tsx`, dentro de la función `enviar()`, se utiliza:

```tsx
datos[id ? 'criaturaId' : 'criatura'] = form.criatura;
```

Esta condición provoca que, al crear un avistamiento, se envíe el campo `criatura`, pero al editarlo se envíe `criaturaId`, que no está permitido por el backend.

**Solución:** Modificar la asignación del campo en el frontend para que siempre se envíe `criatura`, tanto al crear como al editar un avistamiento.

Cambiar:

```tsx
datos[id ? 'criaturaId' : 'criatura'] = form.criatura;
```

Por:

```tsx
datos.criatura = form.criatura;
```

De esta manera, el frontend envía los datos con los nombres de campos esperados por el backend, permitiendo actualizar correctamente los avistamientos sin modificar las validaciones existentes.
------
## B-02 · El detalle no identifica a la criatura

Al momento de visualizar el detalle de un avistamiento, en el campo "Criatura" aparece el ID de la criatura en lugar de su nombre.

Esto ocurre porque el backend está devolviendo únicamente el ID de referencia de MongoDB, en lugar del objeto completo de la criatura.

**Backend:**

En el archivo `avistamientos.service.ts`, la función `obtener()` utiliza:

```ts
const doc = await Avistamiento.findById(idValido(id));
```

Esta consulta obtiene el avistamiento, pero no recupera los datos de la criatura relacionada.

**Frontend:**

En `DetalleAvistamiento.tsx` se utiliza:

```tsx
<dd>{nombreCriatura(datos.criatura)}</dd>
```

La función `nombreCriatura()` muestra el ID cuando recibe un `string`, ya que no dispone del nombre de la criatura.

**Solución:** Agregar `.populate('criatura')` a la consulta `findById()` del backend para recuperar la información de la criatura relacionada.

Cambiar:

```ts
const doc = await Avistamiento.findById(idValido(id));
```

Por:

```ts
const doc = await Avistamiento.findById(idValido(id))
  .populate('criatura');
```

De esta manera, el backend devuelve el objeto de la criatura con su nombre y el frontend puede mostrarlo correctamente sin necesidad de modificaciones adicionales.
-----

B-03 · Se acepta un tipo de criatura inválido
Al enviar una petición de actualización directa desde un cliente HTTP con un tipo no contemplado por las reglas de negocio (como "fantasma"), el backend persiste el cambio con éxito en lugar de rechazarlo.

Esto ocurre porque la validación del campo tipo recae únicamente en los controles de la interfaz de usuario (selector HTML) y el backend carece de una regla de validación o enumeración estricta a nivel de esquema/servicio.

Backend:

En el archivo del modelo correspondiente (criatura.model.ts o esquema de Mongoose/ORM utilizado), la propiedad tipo está definida como un string genérico sin restricción de valores permitidos:

TypeScript
tipo: {
  type: String,
  required: true,
}
Al procesar la actualización en el controlador o servicio, cualquier valor de texto pasa la validación y se guarda directamente en la base de datos.

Impacto:

El selector HTML del frontend previene selecciones erróneas en la vista, pero no protege a los endpoints de la API frente a peticiones externas o directas, generando inconsistencias en los datos almacenados.

Solución: Restringir los valores permitidos para el campo tipo mediante un enum en el esquema del modelo (o en la capa de validación del DTO/middleware).

Cambiar en la definición del esquema:

TypeScript
tipo: {
  type: String,
  required: true,
}
Por:

TypeScript
tipo: {
  type: String,
  required: true,
  enum: {
    values: ['mitica', 'elemental', 'mecanica', 'espectral'],
    message: '{VALUE} no es un tipo de criatura válido'
  }
}
De esta manera:

Una actualización con un tipo válido (como 'mitica') responderá con status 200 OK.

El valor 'fantasma' (o cualquier otro fuera de la lista) será rechazado con un error de validación, retornando status 400 Bad Request y un mensaje descriptivo.

Las consultas posteriores (GET) conservarán el último valor válido registrado sin corromper el estado del documento.