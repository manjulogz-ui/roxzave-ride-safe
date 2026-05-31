# Roxzave Database ER Diagram

```mermaid
erDiagram
    users ||--o{ vehicles : owns
    users ||--o{ emergency_contacts : has
    users ||--o{ trips : takes
    users ||--o{ sos_requests : triggers
    users ||--o{ notifications : receives
    users ||--o{ community_posts : authors
    users ||--o{ guardians : manages
    users ||--o{ driving_scores : earns

    trips ||--o{ trip_events : contains
    trips ||--o{ crash_events : may_have
    trips ||--o{ guardian_tracking : tracked

    community_posts ||--o{ community_comments : has
    community_posts ||--o{ community_likes : has

    devices ||--o{ crash_events : detects
    petrol_stations ||--o{ fuel_prices : has

    users {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string mobile
        int safety_score
        enum role
        bool is_guest
        jsonb preferences
    }

    sos_requests {
        uuid id PK
        uuid user_id FK
        float lat
        float lng
        string status
        bool golden_hour_active
    }

    community_posts {
        uuid id PK
        uuid user_id FK
        string title
        string body
        string category
        int verify_count
    }
```

## Indexes

- `users.email`, `users.mobile`
- `trips.user_id`, `trips.started_at`
- `notifications.user_id`, `notifications.is_read`
- `petrol_stations.lat`, `petrol_stations.lng`
- `sos_requests.status`

## Soft deletes

`users`, `vehicles`, `emergency_contacts`, `trips`, `pothole_reports`, `community_posts`, `community_comments` use `deleted_at`.
