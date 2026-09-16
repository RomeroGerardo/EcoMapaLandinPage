# -*- coding: utf-8 -*-
import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

DIAGRAMS = {
    "01_casos_de_uso": """flowchart LR
    classDef actorStyle fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff,font-weight:bold;
    classDef ucStyle fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#065f46,font-size:12px;

    subgraph ACTORES [" ACTORES "]
        direction TB
        A_CIU["🧑 Ciudadano<br/>[App Movil]"]:::actorStyle
        A_MUN["🏛️ Municipio / Comercio<br/>[Panel Web]"]:::actorStyle
        A_ADM["👑 Superadmin<br/>[Romero Labs]"]:::actorStyle
    end

    subgraph SISTEMA [" SISTEMA ECOMAPA V2.1 "]
        direction TB
        subgraph MOD_CIU [" MODULO CIUDADANO (APP MOVIL) "]
            direction TB
            UC01(["UC-01: Consultar IA para clasificar"]):::ucStyle
            UC02(["UC-02: Ver mapa interactivo con ecopuntos"]):::ucStyle
            UC03(["UC-03: Navegar al punto por GPS"]):::ucStyle
            UC04(["UC-04: Acumular Ecopuntos e Insignias"]):::ucStyle
            UC05(["UC-05: Canjear cupones y beneficios B2B"]):::ucStyle
            UC06(["UC-06: Solicitar retiro a domicilio"]):::ucStyle
            UC07(["UC-07: Descargar APK oficial con QR"]):::ucStyle
        end

        subgraph MOD_MUN [" MODULO MUNICIPIO Y COMERCIOS (PANEL WEB) "]
            direction TB
            UC08(["UC-08: Gestion de Ecopuntos y centros privados"]):::ucStyle
            UC09(["UC-09: Coordinacion de retiros y asignacion"]):::ucStyle
            UC10(["UC-10: Publicacion de recompensas y cupones"]):::ucStyle
            UC11(["UC-11: Administracion productores marcas REP"]):::ucStyle
            UC12(["UC-12: Reportes de impacto ambiental"]):::ucStyle
        end

        subgraph MOD_ADM [" MODULO SUPERADMINISTRACION (SAAS) "]
            direction TB
            UC13(["UC-13: Alta, baja y configuracion de Tenants"]):::ucStyle
            UC14(["UC-14: Control de planes y suscripciones"]):::ucStyle
            UC15(["UC-15: Moderacion y aprobacion de ecopuntos"]):::ucStyle
        end
    end

    A_CIU --> UC01
    A_CIU --> UC02
    A_CIU --> UC03
    A_CIU --> UC05
    A_CIU --> UC06
    A_CIU --> UC07

    A_MUN --> UC08
    A_MUN --> UC09
    A_MUN --> UC10
    A_MUN --> UC11
    A_MUN --> UC12

    A_ADM --> UC13
    A_ADM --> UC14
    A_ADM --> UC15

    UC01 -. "«include»" .-> UC04
    UC06 -. "«extend»" .-> UC09
""",

    "02_clases": """classDiagram
    direction TB

    namespace Domain_Models {
        class RecyclingPoint {
            +String id
            +String name
            +String type
            +String color
            +Double latitude
            +Double longitude
            +String address
            +Double distanceKm
            +Boolean isPrivateFacility
            +String pricePerKgDetail
            +String producerName
        }

        class AiResponse {
            +String wasteType
            +String containerType
            +String containerColor
            +RecyclingPoint suggestedPoint
            +String environmentalImpact
            +Int ecopointsEarned
            +String friendlyMessage
        }

        class ChatMessage {
            +String content
            +Boolean isUser
            +Instant timestamp
            +AiResponse aiResponse
        }

        class Badge {
            +String id
            +String name
            +String icon
            +String description
            +Int bonusPoints
            +Boolean isUnlocked
            +catalog: List~Badge~$
        }

        class UserProgress {
            +Int totalPoints
            +Int queriesCount
            +List~String~ unlockedBadgeIds
            +Instant lastQueryDate
            +Int streakDays
        }

        class GamificationResult {
            +Int pointsEarned
            +Int totalPoints
            +List~Badge~ newBadges
        }

        class PickupRequest {
            +String id
            +String userName
            +String userPhone
            +String wasteType
            +String estimatedVolume
            +String address
            +Double latitude
            +Double longitude
            +String status
            +String assignedCollector
        }

        class Reward {
            +String id
            +String title
            +String partnerName
            +String category
            +Int ecopointsCost
            +Int discountPercentage
            +Int stock
            +Boolean isActive
        }

        class RewardClaim {
            +String id
            +String rewardId
            +String couponCode
            +String status
            +Int pointsSpent
            +String claimedAt
        }
    }

    namespace Domain_Repositories {
        class AiRepository {
            <<interface>>
            +classify(message, lat, lng) Result~AiResponse~
        }

        class MapRepository {
            <<interface>>
            +getNearbyPoints(lat, lng, radiusKm) List~RecyclingPoint~
            +getAllActivePoints() List~RecyclingPoint~
        }

        class GamificationRepository {
            <<interface>>
            +getTotalPoints() Int
            +addPoints(points) Int
            +processReward(response) GamificationResult
            +getUserProgress() UserProgress
            +updateStreak()
        }

        class PickupRepository {
            <<interface>>
            +requestPickup(request) Result~PickupRequest~
        }

        class RewardRepository {
            <<interface>>
            +getRewards() List~Reward~
            +claimReward(reward, userId) Result~RewardClaim~
        }
    }

    namespace Data_Layer {
        class AiRepositoryImpl {
            -SupabaseApi api
            +classify(message, lat, lng) Result~AiResponse~
        }

        class MapRepositoryImpl {
            -SupabaseApi api
            +getNearbyPoints(lat, lng, radiusKm) List~RecyclingPoint~
        }

        class GamificationRepositoryImpl {
            -GamificationStore store
            +processReward(response) GamificationResult
            +updateStreak()
        }

        class PickupRepositoryImpl {
            -SupabaseApi api
            +requestPickup(request) Result~PickupRequest~
        }

        class RewardRepositoryImpl {
            -SupabaseApi api
            -GamificationStore store
            +getRewards() List~Reward~
            +claimReward(reward, userId) Result~RewardClaim~
        }

        class SupabaseApi {
            <<interface Retrofit>>
            +classify(request) AiResponseDto
            +getNearbyPoints(params) List~RecyclingPointDto~
            +getActiveRewards() List~RewardDto~
            +claimReward(claim) List~RewardClaimDto~
            +createPickupRequest(request) List~PickupRequestDto~
        }

        class GamificationStore {
            -DataStore preferences
            +getInt(key) Int
            +setInt(key, value)
            +getString(key) String
        }
    }

    namespace Presentation_ViewModels {
        class HomeViewModel {
            -AiRepository aiRepo
            -MapRepository mapRepo
            -GamificationRepository gamRepo
            +uiState: StateFlow~HomeUiState~
            +sendMessage()
            +updateUserLocation(lat, lng)
        }

        class BadgesViewModel {
            -GamificationRepository gamRepo
            +uiState: StateFlow~BadgesUiState~
        }

        class PickupViewModel {
            -PickupRepository pickupRepo
            +uiState: StateFlow~PickupUiState~
            +submitRequest()
        }

        class RewardsViewModel {
            -RewardRepository rewardRepo
            -GamificationStore store
            +uiState: StateFlow~RewardsUiState~
            +claimReward(reward)
        }
    }

    %% Relaciones
    AiResponse o-- RecyclingPoint : suggests
    ChatMessage o-- AiResponse : contains
    GamificationResult *-- Badge : includes
    RewardClaim ..> Reward : references

    AiRepositoryImpl ..|> AiRepository
    MapRepositoryImpl ..|> MapRepository
    GamificationRepositoryImpl ..|> GamificationRepository
    PickupRepositoryImpl ..|> PickupRepository
    RewardRepositoryImpl ..|> RewardRepository

    AiRepositoryImpl --> SupabaseApi
    MapRepositoryImpl --> SupabaseApi
    PickupRepositoryImpl --> SupabaseApi
    RewardRepositoryImpl --> SupabaseApi
    GamificationRepositoryImpl --> GamificationStore
    RewardRepositoryImpl --> GamificationStore

    HomeViewModel --> AiRepository
    HomeViewModel --> MapRepository
    HomeViewModel --> GamificationRepository
    BadgesViewModel --> GamificationRepository
    PickupViewModel --> PickupRepository
    RewardsViewModel --> RewardRepository
""",

    "03_secuencia_ia": """sequenceDiagram
    autonumber
    actor C as Ciudadano
    participant UI as HomeScreen Compose
    participant VM as HomeViewModel
    participant AR as AiRepositoryImpl
    participant API as SupabaseApi Retrofit
    participant EF as Edge Function classify
    participant GQ as Groq Cloud LLaMA
    participant DB as PostgreSQL PostGIS
    participant GR as GamificationRepository
    participant ST as DataStore Local

    C->>UI: Escribe "¿Donde tiro pilas y baterias?"
    UI->>VM: sendMessage()
    VM->>VM: Agrega ChatMessage(isUser=true)
    VM->>AR: classify(query, lat, lng)
    AR->>API: POST /functions/v1/classify
    API->>EF: { message, user_lat, user_lng }
    Note over EF,GQ: Clasificacion Semantica
    EF->>GQ: Chat Completion (system + user prompt)
    GQ-->>EF: { waste_type, container, impact }
    Note over EF,DB: Busqueda Geoespacial PostGIS
    EF->>DB: RPC get_nearby_points(lat, lng, 25km)
    DB-->>EF: RecyclingPoint (mas cercano)
    EF->>DB: INSERT ai_queries_log (telemetria)
    EF-->>API: AiResponseDto (completo)
    API-->>AR: AiResponseDto
    AR-->>VM: Result.success(AiResponse)
    Note over VM,ST: Gamificacion en Dominio
    VM->>GR: processReward(aiResponse)
    GR->>ST: addPoints(+20), incrementQueries(), updateStreak()
    GR->>GR: evaluateNewBadges()
    GR-->>VM: GamificationResult(points, newBadges)
    VM->>VM: Agrega ChatMessage(isUser=false, aiResponse)
    VM->>VM: Actualiza centerOnPoint en mapa
    VM-->>UI: Emite HomeUiState actualizado
    UI-->>C: Muestra respuesta, mapa centrado e insignia
""",

    "03_secuencia_retiros": """sequenceDiagram
    autonumber
    actor V as Vecino
    participant App as PickupScreen Compose
    participant VM as PickupViewModel
    participant PR as PickupRepositoryImpl
    participant API as SupabaseApi Retrofit
    participant DB as PostgreSQL Supabase
    actor M as Municipio Operador
    participant Web as Panel Web Pickups

    V->>App: Completa formulario de retiro voluminoso
    App->>VM: submitRequest()
    VM->>PR: requestPickup(PickupRequest)
    PR->>API: POST /rest/v1/pickup_requests
    API->>DB: INSERT pickup_requests (status="pendiente")
    DB-->>API: 201 Created (PickupRequestDto)
    API-->>PR: PickupRequestDto
    PR-->>VM: Result.success(PickupRequest)
    VM-->>App: isSuccess = true
    App-->>V: "¡Solicitud enviada! En breve te contactaremos"

    Note over M,DB: Gestion B2G desde Panel Web
    M->>Web: Ingresa a Gestion de Retiros
    Web->>DB: SELECT * FROM pickup_requests WHERE status='pendiente'
    DB-->>Web: Lista de solicitudes pendientes
    M->>Web: Asigna cuadrilla ("Cooperativa Recicla+")
    Web->>DB: UPDATE status="asignado", collector="Cooperativa Recicla+"
    DB-->>Web: 200 OK
    Web-->>M: Solicitud asignada con exito
""",

    "04_arquitectura": """flowchart TB
    classDef clientStyle fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1,font-weight:bold;
    classDef backendStyle fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#065f46,font-weight:bold;
    classDef dbStyle fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e,font-weight:bold;
    classDef aiStyle fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#9d174d,font-weight:bold;
    classDef localStyle fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8,font-weight:bold;

    subgraph CLIENTES [" 🖥️ CAPA DE PRESENTACION (CLIENTES) "]
        direction LR
        APP["📱 App Movil Nativa<br/>- Kotlin + Jetpack Compose<br/>- Clean Architecture MVVM<br/>- OSMDroid OpenStreetMap<br/>- Retrofit + OkHttp"]:::clientStyle
        WEB["🌐 Panel Web Backoffice<br/>- React 19 + TypeScript<br/>- Vite + Tailwind CSS<br/>- Leaflet + React-Leaflet<br/>- Zustand State Manager"]:::clientStyle
        LAND["🏠 Landing Page B2G/B2B<br/>- Material Design 3<br/>- Descarga APK + Modal QR<br/>- Chatbot Comercial IA"]:::clientStyle
    end

    subgraph BACKEND [" ☁️ CAPA DE BACKEND (SUPABASE CLOUD) "]
        AUTH["🔐 Supabase Auth<br/>JWT + RLS (Row Level Security)<br/>3 Roles: Ciudadano, Municipio, Superadmin"]:::backendStyle
        REST["📡 REST API PostgREST<br/>Endpoints auto-generados<br/>Filtros, ordenamiento y relaciones"]:::backendStyle
        EDGE["⚡ Supabase Edge Functions (Deno)<br/>/classify v4<br/>Orquestador Semantico + Fallback"]:::backendStyle
        STORAGE["📦 Supabase Storage<br/>Buckets para APK, logos y fotos"]:::backendStyle
    end

    subgraph DATABASE [" 🗄️ CAPA DE BASE DE DATOS (POSTGRESQL 15) "]
        POSTGIS["🌍 Extension PostGIS<br/>ST_DistanceSphere, ST_DWithin<br/>Busqueda geoespacial indexada"]:::dbStyle
        TABLES["📊 Tablas Principales<br/>tenants, producers, recycling_points<br/>pickup_requests, rewards<br/>reward_claims, ai_queries_log"]:::dbStyle
        RPC["⚙️ Procedimientos Almacenados (PL/pgSQL)<br/>get_nearby_points()<br/>set_geom_from_coords()"]:::dbStyle
    end

    subgraph AI [" 🤖 CAPA DE INTELIGENCIA ARTIFICIAL "]
        GROQ_APP["Groq Cloud API (App Movil)<br/>LLaMA 3.3-70b Versatile<br/>Clasificacion de residuos y contenedores"]:::aiStyle
        GROQ_WEB["Groq Cloud API (Landing Page)<br/>GPT-OSS-120b Commercial<br/>Asesor B2G/B2B y anti-jailbreak"]:::aiStyle
    end

    subgraph LOCAL [" 📲 ALMACENAMIENTO LOCAL "]
        DATASTORE["Android DataStore Preferences<br/>Ecopuntos, racha, insignias y consultas"]:::localStyle
    end

    %% Conexiones
    APP -->|Bearer JWT| REST
    APP -->|POST /classify| EDGE
    APP --> DATASTORE
    WEB -->|Supabase JS SDK| REST
    WEB -->|Auth Session| AUTH
    LAND -->|Axios HTTP| GROQ_WEB

    EDGE -->|API Request| GROQ_APP
    EDGE -->|RPC get_nearby_points| RPC
    EDGE -->|INSERT telemetria| TABLES

    REST --> TABLES
    AUTH --> REST
    RPC --> POSTGIS
    POSTGIS --> TABLES
""",

    "05_der": """erDiagram
    TENANTS ||--o{ RECYCLING_POINTS : "administra"
    TENANTS ||--o{ PICKUP_REQUESTS : "gestiona"
    TENANTS ||--o{ REWARDS : "publica"
    PRODUCERS ||--o{ RECYCLING_POINTS : "certifica"
    REWARDS ||--o{ REWARD_CLAIMS : "genera"

    TENANTS {
        UUID id PK
        TEXT name
        TEXT type
        TEXT subscription_tier
        TEXT subscription_status
        TIMESTAMPTZ subscription_end_date
        TIMESTAMPTZ created_at
    }

    PRODUCERS {
        UUID id PK
        TEXT name
        TEXT category
        TEXT logo_url
        TEXT website
        TEXT contact_email
        TEXT description
        TIMESTAMPTZ created_at
    }

    RECYCLING_POINTS {
        UUID id PK
        TEXT name
        TEXT description
        TEXT type
        TEXT color
        DOUBLE_PRECISION latitude
        DOUBLE_PRECISION longitude
        GEOMETRY geom
        TEXT address
        BOOLEAN is_active
        BOOLEAN is_approved
        BOOLEAN is_private_facility
        TEXT price_per_kg_detail
        UUID tenant_id FK
        UUID producer_id FK
        TEXT producer_name
        TIMESTAMPTZ created_at
    }

    PICKUP_REQUESTS {
        UUID id PK
        TEXT user_name
        TEXT user_phone
        TEXT waste_type
        TEXT estimated_volume
        TEXT notes
        TEXT address
        DOUBLE_PRECISION latitude
        DOUBLE_PRECISION longitude
        TEXT preferred_date
        TEXT preferred_time_slot
        TEXT status
        TEXT assigned_collector
        UUID tenant_id FK
        TIMESTAMPTZ created_at
    }

    REWARDS {
        UUID id PK
        TEXT title
        TEXT partner_name
        TEXT category
        TEXT description
        INT ecopoints_cost
        INT discount_percentage
        INT stock
        BOOLEAN is_active
        UUID tenant_id FK
        TIMESTAMPTZ created_at
    }

    REWARD_CLAIMS {
        UUID id PK
        UUID reward_id FK
        TEXT user_id
        TEXT coupon_code
        INT points_spent
        TEXT status
        TIMESTAMPTZ claimed_at
    }

    AI_QUERIES_LOG {
        UUID id PK
        TEXT waste_category
        INT response_time_ms
        INT ecopoints_awarded
        TIMESTAMPTZ created_at
    }
"""
}

def compile_all():
    print(f"Iniciando compilacion de diagramas en {BASE_DIR}...")
    
    for name, content in DIAGRAMS.items():
        mmd_file = BASE_DIR / f"{name}.mmd"
        svg_file = BASE_DIR / f"{name}.svg"
        png_file = BASE_DIR / f"{name}.png"
        
        mmd_file.write_text(content.strip(), encoding="utf-8")
        print(f"[{name}] Generando SVG...")
        cmd_svg = ["npx", "-y", "@mermaid-js/mermaid-cli", "-i", str(mmd_file), "-o", str(svg_file), "-b", "transparent"]
        res_svg = subprocess.run(cmd_svg, capture_output=True, text=True, shell=True)
        if res_svg.returncode != 0:
            print(f"  Error en {name}.svg: {res_svg.stderr}")
        else:
            print(f"  OK: {svg_file.name}")
            
        print(f"[{name}] Generando PNG (HD scale=2)...")
        cmd_png = ["npx", "-y", "@mermaid-js/mermaid-cli", "-i", str(mmd_file), "-o", str(png_file), "-s", "2", "-b", "white"]
        res_png = subprocess.run(cmd_png, capture_output=True, text=True, shell=True)
        if res_png.returncode != 0:
            print(f"  Error en {name}.png: {res_png.stderr}")
        else:
            print(f"  OK: {png_file.name}")

    print("\n--- Compilacion finalizada con exito ---")

if __name__ == "__main__":
    compile_all()