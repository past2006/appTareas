# Universidad Surcolombiana - Programación de Dispositivos Móviles

### Trabajo autónomo: Construir, instalar y documentar una app de prueba

Este proyecto contiene **appTareas**, una aplicación móvil de lista de tareas desarrollada con Ionic y Angular, y empaquetada para Android con Capacitor. Permite crear, editar, completar y eliminar tareas, con modo oscuro y guardado automático en el dispositivo.

##  Captura de la Aplicación

![App en ejecución](src/assets/captura-app-tareas.png)

##  Requisitos Previos

* **Node.js:** v18+ o superior (recomendado v20+)
* **NPM:** v9+ o superior

## Instalación y Compilación

1. Clonar el repositorio e instalar las dependencias del proyecto:

```
git clone <URL-DEL-REPOSITORIO>
cd appTareas
npm install
```

`npm install` instala todas las dependencias declaradas en `package.json`, entre ellas:

* **Ionic** (`@ionic/angular`): componentes de la interfaz.
* **Capacitor** (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`): puente hacia Android.
* **Angular CDK** (`@angular/cdk`): scroll virtual de la lista de tareas.

Si el proyecto se crea desde cero, la librería de la lista se instala con:

```
npm install @angular/cdk
```

2. Ejecutar el servidor de desarrollo móvil:

```
npx ionic serve
# O alternativamente:
npm start
```

La aplicación se abrirá en `http://localhost:8100/`. Se recomienda abrir las Herramientas de Desarrollador (F12) y activar el modo de emulación de dispositivo móvil (Pixel 7 / iPhone 14).

3. Compilar la aplicación web para producción:

```
npx ionic build
```

4. Copiar la compilación al proyecto nativo de Android con Capacitor:

```
npx cap sync android
```

5. Abrir el proyecto en Android Studio:

```
npx cap open android
```

Esperar a que termine el mensaje *Gradle sync* en la parte inferior.

6. Generar el APK de depuración. En Android Studio:

```
Build → Generate App Bundles or APKs → Generate APKs
```

En versiones anteriores el menú se llama *Build → Build Bundle(s) / APK(s) → Build APK(s)*. 

(En Windows: `gradlew.bat assembleDebug`.) El archivo se genera en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

7. Instalar en un teléfono (solo en un dispositivo propio o autorizado):

* **Opción A, copiar el APK:** pasar `app-debug.apk` al teléfono (cable USB, Drive, etc.), abrirlo y aceptar la instalación. Android puede pedir permiso para instalar apps desconocidas para la aplicación desde la que se abre el archivo.
* **Opción B, cable USB:** activar las *Opciones de desarrollador* (tocar 7 veces el *Número de compilación*) y la *Depuración USB*, conectar el teléfono, elegirlo en la lista de dispositivos de Android Studio y pulsar **Run ▶**. En algunos Samsung hay que desactivar antes el *Bloqueador automático*.
* **Opción C, emulador:** crear un dispositivo en *Device Manager* (por ejemplo, Pixel 6) y pulsar **Run ▶**.
* **Por terminal, con depuración USB activa:**

```
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

> Cada vez que se modifique el código, repetir los pasos 3 y 4 antes de volver a generar el APK. De lo contrario, el APK tendrá la versión anterior.

8. Si el proyecto no trae Capacitor ni la carpeta `android/` (este repositorio ya incluye ambos):

```
npm install @capacitor/core
npm install -D @capacitor/cli
npx cap init
npm install @capacitor/android
npx cap add android
```

## Estructura del Proyecto

```
appTareas/
├── android/                        # Proyecto nativo Android (se versiona)
├── angular.json
├── capacitor.config.ts             # Configuración de Capacitor
├── ionic.config.json
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── global.scss                 # Estilos globales y paleta del modo oscuro
    ├── index.html
    ├── main.ts
    ├── theme/
    │   └── variables.scss
    └── app/
        ├── app.component.html
        ├── app.component.ts
        ├── app.routes.ts
        └── home/
            ├── home.page.html      # Plantilla con componentes Ionic
            ├── home.page.scss      # Estilos de la lista, filtros y botón flotante
            └── home.page.ts        # Lógica y controlador (tareas, modal, alertas, tema)
```

