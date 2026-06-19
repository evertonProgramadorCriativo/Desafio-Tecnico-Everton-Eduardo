 

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