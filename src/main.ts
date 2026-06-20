// Função responsável por iniciar (bootstrap) a aplicação Angular
import { bootstrapApplication } from '@angular/platform-browser';

// Serviços de roteamento do Angular
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';

// Integração do Ionic com Angular
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

// Firebase

// Inicializa a aplicação Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

// Configura e disponibiliza o Firestore (banco de dados NoSQL)
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Arquivo que contém todas as rotas da aplicação
import { routes } from './app/app.routes';

// Componente principal da aplicação
import { AppComponent } from './app/app.component';

// Arquivo de ambiente contendo as credenciais do Firebase
import { environment } from './environments/environment';

// Inicializa a aplicação Angular utilizando o componente raiz
bootstrapApplication(AppComponent, {
  providers: [
    // Estratégia de reutilização de páginas do Ionic
    // Mantém páginas em memória para melhorar a navegação
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Registra os serviços principais do Ionic
    provideIonicAngular(),

    // Configura o sistema de rotas da aplicação
    // PreloadAllModules carrega módulos em segundo plano
    // após a aplicação iniciar, melhorando a navegação futura
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Configuração do Firebase

    // Inicializa o Firebase utilizando as credenciais
    // definidas no arquivo environment.ts
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Disponibiliza o Firestore para toda a aplicação,
    // permitindo realizar operações CRUD no banco de dados
    provideFirestore(() => getFirestore()),
  ],
});
