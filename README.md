## Rotas do VacinaKids

### Script:  reiniciar o servidor

---

**O script completo (PowerShell):**

```powershell
ionic serve
```

### Script:  Limpeza de Cache

---

**O script completo (PowerShell):**

```powershell
Remove-Item -Path .angular\cache -Recurse -Force ; ionic serve
```


O app usa uma estrutura de rotas aninhadas: a rota pai `/tabs` carrega a barra de navegação inferior, e cada filho dela carrega uma página dentro do `ion-router-outlet`.

---

### `/` (raiz)

Redireciona automaticamente para `/tabs/home`. O usuário nunca vê essa rota diretamente — ela existe apenas para garantir que a aplicação sempre comece na home.

---

### `/tabs/home`

**Como acessar:** aba "Início" na barra inferior, ou automaticamente ao abrir o app.

**O que faz:**
- Exibe os chips de seleção de criança quando há mais de uma cadastrada
- Mostra o card de resumo vacinal da criança ativa (doses aplicadas, barra de progresso, percentual)
- Lista alertas de doses atrasadas e pendentes nos próximos 30 dias
- Mostra campanhas ativas filtradas pela idade da criança
- O card de resumo é clicável e navega para `/tabs/children/:id` da criança ativa

**Componente:** `HomePage` — `src/app/home/home.page.ts`

---

### `/tabs/children`

**Como acessar:** aba "Crianças" na barra inferior.

**O que faz:**
- Lista todas as crianças cadastradas com avatar, nome, idade calculada e sexo
- Botão flutuante `+` no canto inferior direito abre o modal `ChildFormComponent` no modo `add`
- Ícone de lápis em cada card abre o mesmo modal no modo `edit` com os dados pré-preenchidos
- Ícone de lixeira abre um `AlertController` pedindo confirmação antes de deletar

**Componente:** `ChildrenListPage` — `src/app/children/children-list/children-list.page.ts`

---

### `/tabs/children/:id`

**Como acessar:** tocando em qualquer card de criança na lista, ou tocando no card de resumo da home.

**O que faz:**
- Carrega a criança pelo `id` vindo do parâmetro de rota (`ActivatedRoute`)
- Exibe o hero colorido com avatar, nome, idade e sexo
- Mostra o card de progresso vacinal com barra colorida e lista de doses atrasadas
- Exibe o grid 2×2 com contadores de atrasadas, pendentes, futuras e aplicadas
- Renderiza o `VaccinationCardComponent` com a carteirinha completa agrupada por fase etária
- Os segmentos da carteirinha filtram: Todas / Realizadas / Pendentes / Atrasadas
- Tocar em dose **aplicada** (verde) abre o `RegisterVaccinationModal` em modo `view` — exibe data, local, lote e profissional
- Tocar em dose **pendente** (amarelo) ou **atrasada** (laranja) abre o mesmo modal em modo `register` — formulário para registrar a aplicação
- Dose **futura** (cinza) não é clicável

**Componente:** `ChildProfilePage` — `src/app/children/child-profile/child-profile.page.ts`

---

### `/tabs/vaccines`

**Como acessar:** aba "Vacinas" na barra inferior.

**O que faz:**
- Lista todas as vacinas do catálogo com nome, sigla e quantidade de doses
- A barra de busca filtra em tempo real por nome ou sigla (case-insensitive) conforme o usuário digita
- Cada item da lista é clicável e navega para `/tabs/vaccines/:id`

**Componente:** `VaccinesListPage` — `src/app/vaccines/vaccines-list/vaccines-list.page.ts`

---

### `/tabs/vaccines/:id`

**Como acessar:** tocando em qualquer vacina da lista.

**O que faz:**
- Carrega a vacina pelo `id` via `VaccineService.getVaccineById()`
- Exibe o hero com nome completo, sigla em badge e descrição
- Renderiza a tabela do esquema de doses: número da dose, idade recomendada em texto amigável (ex: "2 meses", "1 ano e 3 meses") e tolerância em meses
- Botão de voltar retorna à lista de vacinas

**Componente:** `VaccineDetailPage` — `src/app/vaccines/vaccine-detail/vaccine-detail.page.ts`

---

### `/tabs/campaigns`

**Como acessar:** aba "Campanhas" na barra inferior.

**O que faz:**
- Lista todas as campanhas ordenadas: ativas primeiro, encerradas ao final
- Para cada campanha verifica se alguma criança cadastrada se enquadra na faixa etária
- Exibe chip amarelo "Para sua família" com os nomes das crianças elegíveis quando aplicável
- Cada card mostra título, descrição, período (início → fim), público alvo e quantidade de vacinas incluídas
- Campanhas encerradas aparecem com opacidade reduzida e chip cinza

**Componente:** `CampaignsListPage` — `src/app/campaigns/campaigns-list/campaigns-list.page.ts`

---

## CRUD e relação com o banco de dados

### Estrutura atual

O app está em uma fase de transição: a arquitetura dos serviços já foi escrita para o Firestore, mas os dados ainda vêm dos arquivos mock em `src/app/data/`. Os comentários nos serviços marcam exatamente onde o mock deve ser substituído.

---

### `ChildService` — CRUD completo para crianças

Localizado em `src/app/services/child.service.ts`. Este é o serviço mais completo — já tem as quatro operações implementadas com Firestore real:

**Create — `addChild(child)`**
Chama `addDoc()` do Firestore, que cria um documento na coleção `children` e gera um ID automático. Acionado quando o usuário salva o modal de nova criança.

**Read — `getChildren()`**
Usa `collectionData()` que retorna um `Observable` com escuta em tempo real. Toda vez que um documento na coleção `children` mudar no Firestore, a lista na tela atualiza automaticamente sem nenhuma ação do usuário.

**Read filtrado — `getChildrenByResponsavel(responsavelId)`**
Usa `query()` + `where()` para buscar apenas as crianças de um responsável específico. Equivale a um `SELECT * FROM children WHERE responsavelId = 'x'`. Preparado para quando o Firebase Auth estiver ativo.

**Update — `updateChild(id, child)`**
Usa `doc()` para referenciar o documento específico (`children/abc123`) e `updateDoc()` para atualizar apenas os campos enviados, sem sobrescrever o documento inteiro. Acionado quando o usuário salva o modal de edição.

**Delete — `deleteChild(id)`**
Usa `doc()` + `deleteDoc()` para remover o documento permanentemente. Acionado após confirmação no alerta de deleção.

**Situação atual:** a `ChildrenListPage` ainda usa `CHILDREN_MOCK` no `ngOnInit` por enquanto. Para ligar ao Firestore basta trocar por `this.childService.getChildren().subscribe(data => this.children = data)`.

---

### `VaccinationRecordService` — histórico vacinal reativo

Localizado em `src/app/services/vaccination-record.service.ts`. Usa `BehaviorSubject` como estado local em memória, inicializado com `RECORDS_MOCK`.

**Create — `addRecord(record)`**
Gera um ID temporário local (`r-local-timestamp`), atualiza o `BehaviorSubject` com a lista nova e emite para todos os subscribers. O efeito é imediato: a carteirinha e o resumo vacinal reagem e recalculam sem nenhuma chamada extra. Quando o Firestore estiver ativo, será `addDoc(collection(firestore, 'records'), record)`.

**Read — `getRecordsByChild(childId)`**
Retorna um `Observable` filtrado pelo `childId` usando `pipe(map(...))` sobre o `BehaviorSubject`. Qualquer componente que assina esse observable recebe automaticamente os novos registros quando `addRecord` é chamado. Quando o Firestore estiver ativo, será `collectionData(query(..., where('childId', '==', childId)))`.

**Update e Delete:** ainda não implementados — não são necessários no escopo atual do projeto.

---

### `VaccineService` — catálogo somente leitura

Localizado em `src/app/services/vaccine.service.ts`. Retorna dados síncronos do `VACCINES_MOCK` por enquanto. Não há Create, Update ou Delete porque o catálogo de vacinas é gerenciado administrativamente, não pelo usuário do app. Quando o Firestore estiver ativo, o `getVaccines()` vira `collectionData(collection(firestore, 'vaccines'))`.

---

### Como a reatividade conecta tudo

O fluxo quando o usuário registra uma dose funciona assim:

```
usuário preenche o modal
       ↓
RegisterVaccinationModal.salvar()
       ↓
VaccinationRecordService.addRecord(novoRegistro)
       ↓
BehaviorSubject emite lista atualizada
       ↓
VaccinationCardComponent recebe via getRecordsByChild().subscribe()
       ↓
VaccineStatusService.montarCarteirinha() recalcula todos os status
       ↓
ChildProfilePage recebe o novo resumo via subscribe()
       ↓
tela atualiza: barra de progresso, contadores e carteirinha
```

Tudo isso acontece sem nenhum reload de página. Quando o `BehaviorSubject` for substituído por `collectionData()` do Firestore, o mesmo fluxo continua funcionando — só a origem dos dados muda, a reatividade é idêntica.

---
 

## Desafio de Estágio 

**Child** (Criança)
- id, nome, dataNascimento, sexo, fotoUrlytytyty
- pertence a um responsável (userId)

**Vaccine** (Vacina — catálogo)
- id, nome, sigla, descrição
- doses: array de `{ doseNúmero, idadeRecomendadaMeses, tolerânciaMeses }`

**VaccinationRecord** (Histórico vacinal)
- id, childId, vaccineId, doseNúmero
- dataAplicação, localAplicação, lote, profissional

**Campaign** (Campanha)
- id, título, descrição, dataInício, dataFim
- publicoAlvo: `{ idadeMinMeses, idadeMaxMeses }`
- vaccineIds[], status: `ativa | encerrada`

---

## Regras de negócio

### Status de uma dose
A partir da idade da criança e do registro vacinal, cada dose recebe um status calculado:

| Condição | Status | Visual |
|---|---|---|
| Dose aplicada | `aplicada` | verde |
| Data prevista futura, dentro da tolerância | `pendente` | amarelo |
| Data prevista no passado, sem registro | `atrasada` | laranja/vermelho |
| Criança ainda não tem a idade mínima | `futura` | cinza |

**Cálculo da data prevista:** `dataNascimento + idadeRecomendadaMeses`
**Cálculo do atraso:** `hoje > dataNascimento + idadeRecomendadaMeses + tolerânciaMeses` → atrasada

### Campanhas visíveis para uma criança
Uma campanha aparece para a criança se:
- `status === 'ativa'` (dataFim >= hoje)
- `idadeAtualMeses >= publicoAlvo.idadeMinMeses`
- `idadeAtualMeses <= publicoAlvo.idadeMaxMeses`

---



### Detalhamento de cada tela

**Home**
- Seletor de criança ativa (chips horizontais se houver mais de uma)
- Card de resumo: `X de Y vacinas em dia`
- Alertas de doses atrasadas em destaque
- Cards de campanhas ativas relevantes para a criança selecionada
- Próximas vacinas previstas (ordenadas por data)

**Crianças**
- Lista de crianças cadastradas
- Botão "Adicionar criança"
- Ao clicar → Perfil da Criança
  - Foto, nome, idade calculada dinamicamente
  - Linha do tempo vacinal (agrupada por fase: RN, 2m, 4m, 6m…)
  - Filtros: Todas | Realizadas | Pendentes | Atrasadas

**Carteirinha (dentro do Perfil)**
- Tabela por vacina → doses → status
- Ao clicar em dose aplicada → modal com detalhes (data, local, lote)
- Ao clicar em dose pendente/atrasada → modal informativo + opção de registrar

**Vacinas (catálogo)**
- Lista de todas as vacinas do PNI
- Busca por nome/sigla
- Ao clicar → detalhe: descrição, doenças que previne, esquema de doses

**Campanhas**
- Lista de campanhas ativas
- Badge "Para sua família" se alguma criança se enquadra
- Ao clicar → detalhe: vacina, público, período, onde se vacinar

---

## Cenários cobertos

| Cenário | Como é atendido |
|---|---|
| 1 — Identificar doses feitas vs pendentes | Status colorido por dose na carteirinha + resumo na Home |
| 2 — Dose atrasada | Status `atrasada` (laranja) + alerta proeminente na Home |
| 3 — Campanha ativa | Tab Campanhas + cards na Home filtrados pela idade da criança |
| 4 — Múltiplos filhos | Seletor de criança na Home; cada perfil é completamente isolado |

---


## 1. Calcular status de uma dose

**Dado:** criança com `dataNascimento`, dose com `idadeRecomendadaMeses` e `tolerânciaMeses`, e um histórico vacinal.

```
CALCULAR -> dataPrevista = dataNascimento + idadeRecomendadaMeses
CALCULAR -> dataLimite = dataPrevista + tolerânciaMeses
CALCULAR -> idadeAtualMeses = hoje - dataNascimento

BUSCAR -> existe registro dessa dose no histórico?

SE encontrou -> status = "aplicada"
SE não encontrou:
  VERIFICAR -> idadeAtualMeses < idadeRecomendadaMeses -> status = "futura"
  VERIFICAR -> hoje <= dataLimite                      -> status = "pendente"
  VERIFICAR -> hoje > dataLimite                       -> status = "atrasada"
```

---

## 2. Montar a carteirinha completa de uma criança

**Dado:** catálogo de vacinas, cada vacina com N doses.

```
PERCORRER -> cada vacina do catálogo
  PERCORRER -> cada dose dessa vacina
    CALCULAR -> status da dose (lógica acima)
    GUARDAR  -> { vacina, dose, status }

AGRUPAR -> por fase etária (RN, 2 meses, 4 meses...)
ORDENAR -> cada grupo por idadeRecomendadaMeses
```

Resultado: estrutura pronta para renderizar a carteirinha por fase.

---

## 3. Gerar alertas da Home

```
PERCORRER -> toda a carteirinha calculada
FILTRAR   -> doses com status = "atrasada"
FILTRAR   -> doses com status = "pendente" e dataPrevista <= hoje + 30 dias
ORDENAR   -> por urgência (atrasada primeiro, depois pendente)
GUARDAR   -> lista de alertas para exibir
```

---

## 4. Resumo vacinal ("X de Y vacinas em dia")

```
PERCORRER -> carteirinha calculada
CONTAR    -> total de doses que deveriam ter sido aplicadas até hoje
CONTAR    -> doses com status = "aplicada" dentro desse grupo
CALCULAR  -> percentual = aplicadas / totalEsperadas
```

---

## 5. Filtrar campanhas relevantes para uma criança

```
CALCULAR  -> idadeAtualMeses da criança

PERCORRER -> todas as campanhas
VERIFICAR -> campanha.status === "ativa"
VERIFICAR -> idadeAtualMeses >= campanha.publicoAlvo.idadeMin
VERIFICAR -> idadeAtualMeses <= campanha.publicoAlvo.idadeMax
FILTRAR   -> só as que passaram nas 3 verificações
GUARDAR   -> campanhas relevantes para essa criança
```

---

## 6. Tela de múltiplas crianças (Cenário 4)

```
PERCORRER -> lista de crianças do responsável
TRANSFORMAR -> cada criança em { nome, foto, resumoVacinal }
  (para cada uma, executa o cálculo do item 4 acima)

GUARDAR -> criança selecionada no estado da tela
SUBSTITUIR -> criança selecionada quando usuário troca o chip
```

Cada troca de criança é um **SUBSTITUIR** no estado — nenhum dado vaza entre perfis.

---

## 7. Registrar uma dose aplicada

```
VALIDAR   -> data de aplicação não é futura
VALIDAR   -> dose ainda não foi registrada
ADICIONAR -> novo VaccinationRecord no histórico
SUBSTITUIR -> status da dose de "pendente/atrasada" -> "aplicada"
RECALCULAR -> resumo vacinal da criança
```

---

## 8. Busca no catálogo de vacinas

```
ESPERAR   -> usuário digitar no campo
EXTRAIR   -> texto digitado
PERCORRER -> catálogo de vacinas
VERIFICAR -> nome ou sigla contém o texto (case-insensitive)
FILTRAR   -> só as que passaram
GUARDAR   -> lista filtrada para exibir
```

---