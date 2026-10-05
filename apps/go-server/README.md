# Supametrics Worker

Supametrics Worker is a high-performance analytics and background jobs service built with Go and the Fiber web framework. It is designed to collect, store, and provide insights into various analytics events for web projects and applications, supporting API key-based authentication, robust rate limiting, and event quotas.

## Features

- **API Key-based Authentication:** Securely ingest analytics data using public API keys and retrieve detailed reports using private API keys.
- **Rate Limiting and Event Quotas:** Protect the service from abuse and manage resource usage with configurable rate limits and event quotas based on subscription types.
- **Comprehensive Event Logging:** Capture detailed analytics events including pageviews, custom events, UTM parameters, geo-location data (country, city), and user-agent information (browser, OS, device type).
- **IP Anonymization:** Implement privacy-friendly IP anonymization similar to Plausible/Simple Analytics, generating daily-reset visitor IDs.
- **Flexible Analytics Retrieval:** Fetch aggregated analytics summaries (total visits, unique visitors, sessions, durations) and frequency data, filterable by various time ranges (today, yesterday, this week, this month, this year) and event types.
- **Persistent Data Storage:** Utilizes PostgreSQL for reliable and scalable storage of all analytics events and project metadata.
- **High-Speed Caching:** Leverages Redis for efficient caching of hot analytics data, rate limiting counters, and as a foundation for future asynchronous job queues.
- **CORS Support:** Configurable Cross-Origin Resource Sharing to allow secure integration with various client applications.

## Stacks / Technologies

| Technology                          | Description                                              | Link                                                                           |
| :---------------------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Go**                              | Programming Language                                     | [golang.org](https://golang.org/)                                              |
| **Fiber**                           | Fast, Express-inspired web framework for Go              | [gofiber.io](https://gofiber.io/)                                              |
| **PostgreSQL**                      | Powerful, open-source relational database                | [postgresql.org](https://www.postgresql.org/)                                  |
| **Neon**                            | Serverless PostgreSQL                                    | [neon.tech](https://neon.tech/)                                                |
| **Redis**                           | In-memory data store, used for caching and rate limiting | [redis.io](https://redis.io/)                                                  |
| `github.com/google/uuid`            | UUID generation for unique identifiers                   | [github.com/google/uuid](https://github.com/google/uuid)                       |
| `github.com/mssola/user_agent`      | User agent parser                                        | [github.com/mssola/user_agent](https://github.com/mssola/user_agent)           |
| `github.com/oschwald/geoip2-golang` | MaxMind GeoIP2 integration for geo-location lookup       | [github.com/oschwald/geoip2-golang](https://github.com/oschwald/geoip2-golang) |
| `github.com/joho/godotenv`          | Loads environment variables from `.env`                  | [github.com/joho/godotenv](https://github.com/joho/godotenv)                   |

## Usage

Supametrics Worker exposes two primary API endpoints for analytics: one for logging events (public key) and another for retrieving analytics (private key).

### API Keys

- **Public Key (`X-Public-Key` header):** Used for ingesting analytics events from client-side applications. These keys are designed to be exposed and are rate-limited. Format: `supm_<32 hex chars>`
- **Private Key (`X-Private-Key` header):** Used for secure retrieval of analytics data, typically from your backend or a dashboard. These keys should be kept secret. Format: `sk_<64 hex chars>`

### Endpoints

#### 1. Log Analytics Event

- **Endpoint:** `POST /api/v1/analytics/log`
- **Headers:** `X-Public-Key: supm_YOUR_PUBLIC_KEY`
- **Description:** Records a new analytics event.

  **Example Request Body:**

  ```json
  {
    "pathname": "/some-page",
    "hostname": "example.com",
    "session_id": "unique-session-id-123",
    "event_type": "pageview",
    "event_name": null,
    "referrer": "https://google.com",
    "utm_source": "google",
    "utm_medium": "organic",
    "duration": 5000,
    "event_data": {
      "category": "blog",
      "article_id": "post-123"
    }
  }
  ```

#### 2. Get Project Analytics

- **Endpoint:** `GET /api/v1/analytics/project` or `GET /api/v1/analytics/project/:eventName`
- **Headers:** `X-Private-Key: sk_YOUR_PRIVATE_KEY`
- **Query Parameters:**
  - `filter` (optional): `today`, `yesterday`, `thisweek`, `thismonth`, `thisyear` (default: `today`)
  - `eventType` (optional): `pageview`, `custom` (default: `pageview`)
  - `eventName` (optional): Specific custom event name to filter by (only applicable when `eventType` is `custom` or when using `/:eventName` path).
- **Description:** Retrieves aggregated analytics data for a project.

  **Example Request:**

  ```
  GET /api/v1/analytics/project?filter=thismonth&eventType=pageview
  ```

  **Example Response:**

  ```json
  {
    "success": true,
    "message": "Analytics fetched successfully",
    "data": {
      "projectId": "your-project-uuid",
      "filter": "thismonth",
      "eventType": "pageview",
      "totalVisits": 1500,
      "uniqueVisitors": 350,
      "totalSessions": 600,
      "totalDuration": 1800000,
      "avgSessionDuration": 3000,
      "frequency": [
        {
          "time": "2026-09-01T00:00:00Z",
          "totalVisits": 50,
          "uniqueVisitors": 20
        },
        {
          "time": "2026-09-02T00:00:00Z",
          "totalVisits": 75,
          "uniqueVisitors": 30
        }
        // ... more daily data
      ]
    }
  }
  ```
