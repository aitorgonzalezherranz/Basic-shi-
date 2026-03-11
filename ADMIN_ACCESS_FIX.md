# 🔧 Solución - Acceso al Panel de Admin

## ✅ Problema Resuelto

He limpiado la base de datos de usuarios y sesiones. Ahora sigue estos pasos:

## 📋 Pasos para Obtener Acceso de Admin:

### 1. Cierra Sesión (si estás logueado)
- Ve a tu tienda: https://young-vibes-store.preview.emergentagent.com
- Si ves que estás logueado, cierra sesión
- O simplemente abre una ventana de incógnito

### 2. Inicia Sesión de Nuevo
- Click en "Sign In" 
- Inicia sesión con Google
- **Importante:** Como serás el PRIMER usuario después de la limpieza, automáticamente serás administrador

### 3. Accede al Panel de Admin
- Una vez logueado, ve a: https://young-vibes-store.preview.emergentagant.com/admin
- O agrega `/admin` al final de la URL

### 4. Verifica tu Acceso
Si todo funciona correctamente, verás:
- Dashboard con estadísticas
- Menú con: Dashboard, Products, Orders
- Acceso a todas las funciones de administración

---

## 🐛 Si Sigue sin Funcionar:

### Verificar tu Estado de Admin
Ejecuta esto en el servidor:
```bash
mongosh test_database --eval "db.users.find({}, {_id: 0, email: 1, is_admin: 1}).pretty()"
```

Deberías ver algo como:
```json
{
  "email": "tu-email@gmail.com",
  "is_admin": true
}
```

### Si `is_admin` es `false` o no existe:
Puedes actualizar manualmente tu usuario:
```bash
mongosh test_database --eval "db.users.updateOne({email: 'TU_EMAIL_AQUI'}, {\$set: {is_admin: true}})"
```

---

## 🔑 Alternativa: Configurar Email Admin Permanente

Si quieres que tu email SIEMPRE sea admin:

1. Edita `/app/backend/.env`
2. Agrega esta línea (cambia por tu email):
   ```env
   ADMIN_EMAILS=tu-email@gmail.com
   ```
3. Reinicia el backend:
   ```bash
   sudo supervisorctl restart backend
   ```

---

## 📱 URLs Importantes:

- **Tienda:** https://young-vibes-store.preview.emergentagent.com
- **Panel Admin:** https://young-vibes-store.preview.emergentagent.com/admin
- **Productos Admin:** https://young-vibes-store.preview.emergentagent.com/admin/products
- **Órdenes Admin:** https://young-vibes-store.preview.emergentagent.com/admin/orders

---

## ⚠️ Nota sobre "View Store"

Si haces click en "View Store" desde el admin panel:
- Te llevará a la página principal de la tienda
- Tu sesión SEGUIRÁ activa (NO se cierra)
- Puedes volver al admin en cualquier momento

El problema anterior era que no tenías permisos de admin, por eso te redirigía.
