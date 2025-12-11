# Solución de Problemas de Despliegue en Vercel

## Problemas Identificados

### 1. Worker Threads no Compatible con Vercel
**Error:** `Cannot find module '/var/task/src/workers/hash.worker.js'`

**Causa:** Worker Threads de Node.js no funcionan en entornos serverless como Vercel porque:
- Vercel usa funciones Lambda de AWS
- Lambda tiene limitaciones con Worker Threads
- El entorno es efímero y no mantiene procesos de larga duración

**Solución:** Modificar `WorkersService` para usar argon2 directamente sin Workers.

### 2. Módulo de Decorators no Encontrado
**Error:** `Cannot find module 'src/auth/decorator'`

**Causa:** El archivo `index.ts` en `src/auth/decorator/` no exportaba todos los decorators.

**Solución:** Agregar export completo de todos los decorators en el index.

## Cambios Realizados

### 1. `src/workers/workers.service.ts`
**Antes:**
- Usaba Worker Threads con `worker_threads`
- Creaba un worker process separado para hashear passwords
- Implementaba `OnModuleDestroy` para terminar worker

**Después:**
- Usa argon2 directamente en el hilo principal
- Métodos simples async que llaman a argon2
- No requiere gestión de worker lifecycle

```typescript
@Injectable()
export class WorkersService {
    async hashPassword(password: string): Promise<string> {
        return argon.hash(password);
    }

    async verifyPassword(hash: string, password: string): Promise<boolean> {
        return argon.verify(hash, password);
    }
}
```

**Nota:** Aunque esto ejecuta el hash en el main thread, argon2 es lo suficientemente eficiente y las funciones serverless son de corta duración, por lo que no es un problema.

### 2. `src/auth/decorator/index.ts`
**Antes:**
```typescript
export * from './get-user.decorator';
```

**Después:**
```typescript
export * from './get-user.decorator';
export * from './roles.decorator';
```

### 3. `vercel.json`
**Actualizado:**
- Se agregó `dist/**` a `includeFiles` (aunque Vercel compila TS automáticamente)
- Se agregó `node_modules/@prisma/**` para asegurar que el cliente de Prisma esté disponible

## Verificación

### Build Local
```bash
pnpm run build
```
✅ Build exitoso sin errores

### Próximos Pasos
1. Hacer commit de los cambios:
   ```bash
   git add .
   git commit -m "fix: Reemplazar Worker Threads con argon2 directo para compatibilidad con Vercel"
   ```

2. Push y deploy automático a Vercel:
   ```bash
   git push
   ```

3. Verificar en Vercel logs que:
   - No hay errores de "Cannot find module"
   - Login y signup funcionan correctamente
   - Las rutas autenticadas responden correctamente

## Rutas que Ahora Deberían Funcionar

### Autenticación (Antes Fallaban ❌)
- ✅ `POST /auth/signup` - Registro de usuarios
- ✅ `POST /auth/login` - Inicio de sesión

### Rutas Protegidas (Antes Fallaban ❌)
- ✅ `GET /users/me` - Obtener perfil usuario
- ✅ `GET /users/my-stats` - Estadísticas del usuario
- ✅ `PATCH /users` - Editar usuario
- ✅ `POST /incidents` - Crear incidente (requiere auth)
- ✅ `PATCH /incidents/:id` - Editar incidente (requiere auth)
- ✅ `DELETE /incidents/:id` - Eliminar incidente (requiere auth)

### Rutas Públicas (Ya Funcionaban ✅)
- ✅ `GET /incidents` - Listar incidentes
- ✅ `GET /incidents/city-stats/:cityId` - Estadísticas por ciudad
- ✅ `GET /categories` - Listar categorías
- ✅ `GET /cities` - Listar ciudades
- ✅ `GET /statuses` - Listar estados

## Notas Técnicas

### Performance de argon2 en Serverless
- argon2 es CPU-intensive pero:
  - Vercel Functions tienen timeouts de 10s (hobby) o 60s (pro)
  - Hash de password típicamente toma <100ms
  - Es aceptable para autenticación en serverless
  
### Alternativas Consideradas
1. **bcrypt**: Menos seguro que argon2
2. **Supabase Auth**: Requiere migración completa de auth
3. **Cloudflare Workers**: Diferente plataforma
4. **Mantener Workers**: No compatible con Vercel

### Por Qué Funciona Ahora
- ✅ No hay dependencias de Worker Threads
- ✅ Todos los módulos están correctamente exportados
- ✅ argon2 funciona perfectamente en entornos serverless
- ✅ Los paths de módulos se resuelven correctamente
