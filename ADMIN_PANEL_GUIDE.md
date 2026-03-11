# Panel de Administración - Basic Shi

## 🔑 Acceso al Panel de Admin

**URL del Panel:** https://young-vibes-store.preview.emergentagent.com/admin

### ¿Cómo Obtener Acceso de Administrador?

#### Opción 1: Primer Usuario (Automático)
El **primer usuario** que se registre en la tienda automáticamente tendrá permisos de administrador.

**Pasos:**
1. Ve a la tienda: https://young-vibes-store.preview.emergentagent.com
2. Haz clic en "Sign In"
3. Inicia sesión con tu cuenta de Google
4. Automáticamente tendrás acceso de admin

#### Opción 2: Configurar Emails Específicos
Puedes configurar emails específicos que siempre tendrán acceso de admin.

**Configuración:**
1. Edita el archivo `/app/backend/.env`
2. Agrega la siguiente línea:
   ```env
   ADMIN_EMAILS=tu-email@gmail.com,otro-admin@gmail.com
   ```
3. Reinicia el backend:
   ```bash
   sudo supervisorctl restart backend
   ```

---

## 🎯 Funcionalidades del Panel de Admin

### 1. Dashboard (/)
- **Estadísticas en Tiempo Real:**
  - Total de ingresos (completados y pendientes)
  - Número total de órdenes
  - Cantidad de productos en catálogo
  - Usuarios registrados
- **Órdenes Recientes:** Ver las últimas 5 órdenes

**URL:** https://young-vibes-store.preview.emergentagent.com/admin

---

### 2. Gestión de Productos (/admin/products)
**URL:** https://young-vibes-store.preview.emergentagent.com/admin/products

#### Funciones Disponibles:
- ✅ **Ver todos los productos** en formato tabla
- ➕ **Añadir nuevos productos:**
  - Nombre del producto
  - Descripción
  - Precio
  - Categoría (8 categorías disponibles)
  - Marca (opcional)
  - URL de imagen
  - Stock disponible
- ✏️ **Editar productos existentes:** Modificar cualquier campo
- 🗑️ **Eliminar productos:** Con confirmación de seguridad

---

### 3. Gestión de Órdenes (/admin/orders)
**URL:** https://young-vibes-store.preview.emergentagent.com/admin/orders

#### Funciones Disponibles:
- 📦 **Ver todas las órdenes** del sistema
- 👤 **Información del cliente:**
  - Nombre
  - Email
  - Items comprados
  - Total de la orden
- 🔄 **Cambiar estado de órdenes:**
  - Pending (Pendiente)
  - Completed (Completada)
  - Shipped (Enviada)
  - Cancelled (Cancelada)
- 🔍 **Filtrar por estado:** Ver solo órdenes pending, completed, etc.
- 💳 **Ver PayPal Order ID** (cuando aplique)

---

## 🚀 Navegación del Panel

El panel incluye una barra de navegación superior con:
- **Dashboard** - Estadísticas generales
- **Products** - Gestionar productos
- **Orders** - Gestionar órdenes
- **View Store** - Ir a la tienda pública
- **Logout** - Cerrar sesión

---

## 🔒 Seguridad

### Protección de Rutas
- Solo usuarios con `is_admin: true` pueden acceder al panel
- Usuarios no-admin son redirigidos a la página principal
- Todas las rutas admin están protegidas en el backend

### Permisos por Endpoint
Todos los endpoints admin están protegidos:
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/orders` - Ver todas las órdenes
- `PATCH /api/admin/orders/{id}/status` - Actualizar estado
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/{id}` - Actualizar producto
- `DELETE /api/admin/products/{id}` - Eliminar producto

---

## 📊 Categorías de Productos

Las 8 categorías disponibles son:
1. **perfumes** - Fragancias
2. **auriculares** - Headphones & Earbuds
3. **zapatillas** - Sneakers
4. **mochilas** - Backpacks
5. **altavoces** - Speakers
6. **relojes** - Watches & Smartwatches
7. **ropa** - Clothing
8. **gorras** - Caps & Hats

---

## 💡 Ejemplos de Uso

### Añadir un Producto Nuevo
1. Ve a `/admin/products`
2. Click en "Add Product"
3. Rellena el formulario:
   - **Name:** "Nike Air Force 1"
   - **Description:** "Classic white sneakers with iconic design"
   - **Price:** 110.00
   - **Category:** zapatillas
   - **Brand:** Nike
   - **Image URL:** https://...
   - **Stock:** 50
4. Click "Add Product"

### Gestionar una Orden
1. Ve a `/admin/orders`
2. Encuentra la orden del cliente
3. Cambia el estado de "pending" a "completed"
4. El cliente verá el cambio en su dashboard

### Ver Estadísticas
1. Ve a `/admin` (Dashboard)
2. Revisa:
   - Ingresos totales
   - Órdenes completadas
   - Stock de productos
   - Últimas ventas

---

## 🎨 Diseño

El panel de admin mantiene el mismo diseño oscuro minimalista de la tienda:
- Background: `#050505`
- Glass-morphism effects
- Space Grotesk para títulos
- Navegación flotante consistente

---

## 🔧 Soporte Técnico

### Si no puedes acceder al panel:
1. Verifica que iniciaste sesión
2. Comprueba si tu email está en `ADMIN_EMAILS` (si configurado)
3. Si eres el primer usuario, intenta cerrar sesión y volver a entrar

### Para verificar tu estado de admin:
```bash
# En el servidor
mongosh --eval "use('test_database'); db.users.find({}, {_id: 0, email: 1, is_admin: 1}).pretty()"
```

---

## 📈 Próximas Mejoras

Posibles mejoras al panel de admin:
- Exportar órdenes a CSV/Excel
- Gráficos de ventas por fecha
- Gestión de usuarios (hacer admin a otros usuarios)
- Notificaciones de nuevas órdenes
- Editor de imágenes integrado
- Importación masiva de productos
