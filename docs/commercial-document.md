# MatchClass

## Propuesta Formal de Proyecto y Solución Tecnológica de Coordinación Académica

* **Cliente / Institución:** Universidad Técnica Federico Santa María (USM)[cite: 3]
* **Plataforma:** Aplicación Web Progresiva (PWA / Web Mobile First)[cite: 3]
* **Fecha:** Julio 2026
* **Enfoque:** Estrategia de Negocio, UX y Eficiencia Operativa[cite: 3]

---

## 1. Resumen Ejecutivo

MatchClass es una plataforma web inteligente diseñada para optimizar y automatizar la programación de ayudantías y actividades académicas complementarias en instituciones de educación superior[cite: 3]. Resuelve de raíz el problema de la falta de quórum y la lentitud en la coordinación horaria mediante una innovación metodológica clave: la **Inversión de Carga de Entrada de Datos**[cite: 3].

> 💡 **La Propuesta de Valor Central:**  
> En lugar de requerir que cada estudiante busque y marque sus decenas de bloques libres en una grilla pesada, MatchClass les solicita marcar únicamente los bloques donde tienen compromisos ocupados (sus clases o trabajo)[cite: 3]. Esta simple inversión reduce el tiempo de respuesta de cada alumno de varios minutos a menos de 30 segundos[cite: 3].

---

## 2. Diagnóstico: Problemática vs. Solución Optimizada

| Problemática Actual (Sin MatchClass) | Solución Optimizada (Con MatchClass) |
| :--- | :--- |
| **Coordinación Lenta e Informal:** Consultas dispersas en grupos de WhatsApp o Discord que generan decenas de mensajes sin consenso.[cite: 3] | **Enlace Único de Sala:** Acceso centralizado y directo a una sala web interactiva dedicada por asignatura.[cite: 3] |
| **Alta Fricción para Responder:** El alumno debe analizar minuciosamente toda su agenda semanal para responder cuándo está libre.[cite: 3] | **Respuesta Invertida Instantánea:** El alumno solo hace clic sobre los 3 o 4 bloques donde tiene clases cargadas.[cite: 3] |
| **Falta de Persistencia:** Si una ayudantía se cancela o cae en feriado, hay que volver a hacer encuestas desde cero.[cite: 3] | **Reorganización Inmediata:** Los datos quedan guardados; el ayudante consulta la segunda mejor opción horaria en un solo clic.[cite: 3] |
| **Invasión de Privacidad:** Riesgo de exponer la agenda personal del ayudante o profesor frente al alumnado.[cite: 3] | **Privacidad Garantizada:** El horario del ayudante filtra los bloques de forma interna como restricción absoluta, sin exponer su agenda.[cite: 3] |

---

## 3. Adaptación Nativa a la Matriz Horaria USM (20 Bloques)

Para asegurar una adopción inmediata y cero curva de aprendizaje por parte de los alumnos y docentes, la plataforma viene precargada con la estructura horaria oficial de la **Universidad Técnica Federico Santa María (USM)**[cite: 3]:

| Pareja de Bloques | Módulos USM | Horario de Clases | Receso / Configuración |
| :--- | :--- | :--- | :--- |
| **Bloque 1 - 2** | Módulos 1 y 2 | 08:15 – 09:25 | Receso 15 min (09:25 – 09:40) |
| **Bloque 3 - 4** | Módulos 3 y 4 | 09:40 – 10:50 | Receso 15 min (10:50 – 11:05) |
| **Bloque 5 - 6** | Módulos 5 y 6 | 11:05 – 12:15 | Receso 15 min (12:15 – 12:30) |
| **Bloque 7 - 8** | Módulos 7 y 8 | 12:30 – 13:40 | Almuerzo / Ventana Institucional |
| **Bloque 9 - 10** | Módulos 9 y 10 | 14:40 – 15:50 | Receso 15 min (15:40 – 15:55) |
| **Bloque 11 - 12** | Módulos 11 y 12 | 16:15 – 17:15 | Receso 15 min (17:05 – 17:20) |
| **Bloque 13 - 14** | Módulos 13 y 14 | 17:30 – 18:40 | Receso 15 min (18:30 – 18:45) |
| **Bloque 15 - 16** | Módulos 15 y 16 | 18:50 – 20:00 | Receso 5 min (19:55 – 20:00) |
| **Bloque 17 - 18** | Módulos 17 y 18 | — | Jornada Vespertina |
| **Bloque 19 - 20** | Módulos 19 y 20 | — | Jornada Vespertina |

---

## 4. Flujo de Experiencia de Usuario (UI/UX)

* **Paso 1: Creación de Sala y Filtro por el Ayudante (Administrador)**  
  El ayudante crea la sala (ej. *Estructuras de Datos - Secc 1*) y define sus propios bloques ocupados[cite: 3]. Esta información actúa como una restricción dura (*Hard Constraint*); los bloques bloqueados por el ayudante quedan invalidados internamente sin exponer su agenda personal[cite: 3].

* **Paso 2: Respuesta Frictionless del Alumno**  
  Los alumnos ingresan mediante el enlace de la sala (o código corto)[cite: 3]. No requieren crear cuenta ni ingresar contraseñas[cite: 3]. Indican su nombre y seleccionan en la grilla interactiva únicamente sus bloques ocupados[cite: 3].

* **Paso 3: Visualización de Resultados y Ranking Automático**  
  El sistema procesa la información y presenta al ayudante un Mapa de Calor (*Heatmap*) visual y un Ranking Top 3 de Recomendaciones con los mejores bloques disponibles para dictar la clase[cite: 3].

---

## 5. Visualización del Mapa de Calor y Ranking Recomendador

El ayudante toma decisiones en segundos gracias al código de colores e indicadores directos[cite: 3]:

* 🟢 **Verde (≥ 70%):** Disponibilidad alta[cite: 3]. Bloque recomendado[cite: 3].
* 🟡 **Ámbar (40% - 69%):** Disponibilidad media[cite: 3]. Usar solo como alternativa secundaria[cite: 3].
* 🟠 **Naranja (10% - 39%):** Disponibilidad baja[cite: 3]. Poco recomendado[cite: 3].
* 🔴 **Rojo (< 10%):** Conflicto mayoritario de horarios[cite: 3].
* 🔘 **Gris / Deshabilitado:** Indisponibilidad del Ayudante (Restricción Absoluta)[cite: 3].

> ⭐ **Ejemplo del Ranking Automático que ve el Ayudante:**
> * **1° Lugar:** Martes, Bloque 9-10 (14:40 - 15:50) — 38/40 Alumnos disponibles (95%)[cite: 3]
> * **2° Lugar:** Jueves, Bloque 11-12 (16:15 - 17:15) — 35/40 Alumnos disponibles (88%)[cite: 3]
> * **3° Lugar:** Viernes, Bloque 5-6 (11:05 - 12:15) — 33/40 Alumnos disponibles (83%)[cite: 3]

---

## 6. Plan de Implementación (Roadmap)

* **Fase 1 — Diseño de Experiencia e Infraestructura (Semana 1):** Configuración del entorno web, base de datos en la nube y maquetación de la matriz interactiva USM[cite: 3].
* **Fase 2 — Módulo de Captura y Respuesta (Semana 2):** Desarrollo del flujo de respuesta para alumnos sin registro y persistencia de edición local[cite: 3].
* **Fase 3 — Panel de Administración y Motor de Matching (Semana 3):** Implementación de salas para ayudantes, generación del mapa de calor en tiempo real y algoritmo de ranking[cite: 3].
* **Fase 4 — Pilotaje y Despliegue Oficial (Semana 4):** Pruebas piloto con ayudantes y asignaturas seleccionadas en la USM, ajuste de usabilidad y lanzamiento formal[cite: 3].