# BoardFood Backend Project Rules

## Knowledge Base & Codebase Graph
* **Consult Codebase Graph First:** Antes de realizar cualquier cambio de código, refactorización, análisis de arquitectura o consulta de dependencias entre el Backend (`BoardFood-Backend`) y el Frontend (`BoardFood`), se debe consultar primero el grafo de conocimiento unificado alojado en `graphify-out/` (`GRAPH_REPORT.md` o `graph.json`) presente en `BoardFood-Backend/graphify-out/` (o `BoardFood/graphify-out/`).

---

## Reglas para el Backend (BoardFood-Backend)
* **Tecnología:** Node.js.
* **Base de Datos:** MySQL (catálogo de comida y usuarios).
* **Autenticación:** Implementar la lógica para validar los tokens de Google y Apple.
