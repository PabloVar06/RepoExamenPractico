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

## B-03 · Se acepta un tipo de criatura inválido

Al enviar una petición de actualización desde Thunder Client con un tipo de criatura no permitido, como `"fantasma"`, el backend permite guardar el cambio, aunque los únicos tipos válidos son `mitica`, `elemental`, `mecanica` y `espectral`.

Esto ocurre porque, aunque el modelo de MongoDB tiene configurada correctamente la validación `enum`, la función de actualización no ejecutaba los validadores de Mongoose.

**Backend:**

En el archivo `Criatura.model.ts`, los tipos permitidos están definidos mediante:

```ts
export const TIPOS = [
  'mitica',
  'elemental',
  'mecanica',
  'espectral'
] as const;
```

Y el esquema utiliza:

```ts
tipo: {
  type: String,
  required: true,
  enum: [...TIPOS]
}
```

Sin embargo, en `criaturas.service.ts`, la función `actualizar()` utilizaba:

```ts
const doc = await Criatura.findByIdAndUpdate(
  idValido(id),
  { $set: cambios },
  { new: true }
);
```

Por defecto, `findByIdAndUpdate()` no ejecuta los validadores del esquema, permitiendo almacenar valores que incumplen las restricciones del modelo.

**Impacto:**

El selector HTML del frontend limita las opciones disponibles para el usuario, pero no protege directamente los endpoints de la API. Esto permite que clientes HTTP externos envíen valores inválidos y generen inconsistencias en MongoDB.

**Solución:** Agregar `runValidators: true` a la consulta de actualización para ejecutar las validaciones definidas en el esquema.

Cambiar:

```ts
const doc = await Criatura.findByIdAndUpdate(
  idValido(id),
  { $set: cambios },
  { new: true }
);
```

Por:

```ts
const doc = await Criatura.findByIdAndUpdate(
  idValido(id),
  { $set: cambios },
  {
    new: true,
    runValidators: true
  }
);
```

De esta manera, Mongoose comprueba que el tipo enviado pertenezca a los valores permitidos.

**Verificación esperada:**

- Una actualización con `"tipo": "mitica"` devuelve `200 OK`.
- Una actualización con `"tipo": "fantasma"` devuelve `400 Bad Request` con un mensaje de validación.
- Una consulta GET posterior conserva el último tipo válido almacenado.

**Estado:** Corrección implementada en el código. Pendiente de confirmar los tres resultados mediante Thunder Client.
-----
## B-03 · Se acepta un tipo de criatura inválido

Al enviar una petición de actualización desde Thunder Client con un tipo de criatura no permitido, como `"fantasma"`, el backend permite guardar el cambio, aunque los únicos tipos válidos son `mitica`, `elemental`, `mecanica` y `espectral`.

Esto ocurre porque, aunque el modelo de MongoDB tiene configurada correctamente la validación `enum`, la función de actualización no ejecutaba los validadores de Mongoose.

**Backend:**

En el archivo `Criatura.model.ts`, los tipos permitidos están definidos mediante:

```ts
export const TIPOS = [
  'mitica',
  'elemental',
  'mecanica',
  'espectral'
] as const;
```

Y el esquema utiliza:

```ts
tipo: {
  type: String,
  required: true,
  enum: [...TIPOS]
}
```

Sin embargo, en `criaturas.service.ts`, la función `actualizar()` utilizaba:

```ts
const doc = await Criatura.findByIdAndUpdate(
  idValido(id),
  { $set: cambios },
  { new: true }
);
```

Por defecto, `findByIdAndUpdate()` no ejecuta los validadores del esquema, permitiendo almacenar valores que incumplen las restricciones del modelo.

**Impacto:**

El selector HTML del frontend limita las opciones disponibles para el usuario, pero no protege directamente los endpoints de la API. Esto permite que clientes HTTP externos envíen valores inválidos y generen inconsistencias en MongoDB.

**Solución:** Agregar `runValidators: true` a la consulta de actualización para ejecutar las validaciones definidas en el esquema.

Cambiar:

```ts
const doc = await Criatura.findByIdAndUpdate(
  idValido(id),
  { $set: cambios },
  { new: true }
);
```

Por:

```ts
const doc = await Criatura.findByIdAndUpdate(
  idValido(id),
  { $set: cambios },
  {
    new: true,
    runValidators: true
  }
);
```

De esta manera, Mongoose comprueba que el tipo enviado pertenezca a los valores permitidos.

**Verificación esperada:**

- Una actualización con `"tipo": "mitica"` devuelve `200 OK`.
- Una actualización con `"tipo": "fantasma"` devuelve `400 Bad Request` con un mensaje de validación.
- Una consulta GET posterior conserva el último tipo válido almacenado.

**Estado:** Corrección implementada en el código. Pendiente de confirmar los tres resultados mediante Thunder Client.