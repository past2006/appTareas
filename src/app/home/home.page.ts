import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  AlertController,
  ToastController,
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonCheckbox, IonButton, IonButtons, IonIcon, IonSegment,
  IonSegmentButton, IonFab, IonFabButton, IonModal, IonInput, IonTextarea,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, clipboardOutline, createOutline, moon, sunny, trashOutline } from 'ionicons/icons';

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  hecha: boolean;
}

interface Fila extends Tarea {
  espaciador?: boolean;
}

type Filtro = 'todas' | 'pendientes' | 'hechas';

const CLAVE = 'tareas-app:tareas';
const CLAVE_TEMA = 'tareas-app:oscuro';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule, ScrollingModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonCheckbox, IonButton, IonButtons, IonIcon, IonSegment,
    IonSegmentButton, IonFab, IonFabButton, IonModal, IonInput, IonTextarea,
  ],
})
export class HomePage {
  // Formulario 
  titulo = '';
  descripcion = '';
  modalAbierto = signal(false);
  editandoId: number | null = null; 

  tareas = signal<Tarea[]>(this.cargar());
  filtro = signal<Filtro>('todas');
  oscuro = signal(this.temaInicial());

  visibles = computed(() => {
    const f = this.filtro();
    return this.tareas().filter((t) =>
      f === 'todas' ? true : f === 'hechas' ? t.hecha : !t.hecha
    );
  });
  
  filas = computed<Fila[]>(() => {
    const lista: Fila[] = [...this.visibles()];
    if (lista.length > 0) {
      lista.push(
        { id: -1, titulo: '', descripcion: '', hecha: false, espaciador: true },
        { id: -2, titulo: '', descripcion: '', hecha: false, espaciador: true }
      );
    }
    return lista;
  });
  pendientes = computed(() => this.tareas().filter((t) => !t.hecha).length);
  hechas = computed(() => this.tareas().filter((t) => t.hecha).length);

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, trashOutline, createOutline, clipboardOutline, moon, sunny });

    effect(() => {
      try {
        localStorage.setItem(CLAVE, JSON.stringify(this.tareas()));
      } catch {}
    });

    // modo oscuro
    effect(() => {
      const activo = this.oscuro();
      document.documentElement.classList.toggle('ion-palette-dark', activo);
      try {
        localStorage.setItem(CLAVE_TEMA, activo ? '1' : '0');
      } catch {}
    });
  }

  abrirModal(tarea?: Tarea) {
    this.editandoId = tarea ? tarea.id : null;
    this.titulo = tarea ? tarea.titulo : '';
    this.descripcion = tarea ? tarea.descripcion : '';
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  async guardar() {
    const titulo = this.titulo.trim();
    if (!titulo) return; 
    const descripcion = this.descripcion.trim(); 

    if (this.editandoId !== null) {
      const id = this.editandoId;
      this.tareas.update((l) => l.map((t) => (t.id === id ? { ...t, titulo, descripcion } : t)));
      this.cerrarModal();
      await this.mostrarToast('Tarea actualizada', 'success');
    } else {
      this.tareas.update((l) => [
        { id: Date.now(), titulo, descripcion, hecha: false },
        ...l,
      ]);
      this.cerrarModal();
      await this.mostrarToast('Tarea creada', 'success');
    }
  }

  porId(_: number, fila: Fila) {
    return fila.id;
  }

  // Tareas 
  alternar(id: number) {
    this.tareas.update((l) => l.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)));
  }

  // Al tocar una tarea se muestra el título y la descripción completos
  async verDetalle(tarea: Tarea) {
    const alerta = await this.alertCtrl.create({
      header: tarea.titulo,
      message: tarea.descripcion || 'Esta tarea no tiene descripción.',
      buttons: ['Cerrar'],
    });
    await alerta.present();
  }

  async confirmarEliminar(tarea: Tarea) {
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: `¿Seguro que quieres eliminar "${tarea.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.tareas.update((l) => l.filter((t) => t.id !== tarea.id));
            this.mostrarToast('Tarea eliminada', 'danger');
          },
        },
      ],
    });
    await alerta.present();
  }

  // Elimina  tareas hechas
  async eliminarHechas() {
    const cantidad = this.hechas();
    if (cantidad === 0) return;
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar tareas hechas',
      message: `¿Seguro que quieres eliminar ${cantidad} ${cantidad === 1 ? 'tarea hecha' : 'tareas hechas'}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.tareas.update((l) => l.filter((t) => !t.hecha));
            this.mostrarToast(cantidad === 1 ? 'Tarea eliminada' : 'Tareas eliminadas', 'danger');
          },
        },
      ],
    });
    await alerta.present();
  }

  cambiarFiltro(valor: unknown) {
    if (valor === 'todas' || valor === 'pendientes' || valor === 'hechas') {
      this.filtro.set(valor);
    }
  }


  alternarTema() {
    this.oscuro.update((v) => !v);
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 1800,
      position: 'top',
      color,
    });
    await toast.present();
  }

  private temaInicial(): boolean {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA);
      if (guardado !== null) return guardado === '1';
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private cargar(): Tarea[] {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? (JSON.parse(guardado) as Tarea[]) : [];
    } catch {
      return [];
    }
  }
}