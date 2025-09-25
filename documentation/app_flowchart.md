flowchart TD
  A[Start] --> B[User Requests Page]
  B --> C[Render Layout]
  C --> D[Setup Clerk Provider]
  D --> E[Apply Global Styles]
  E --> F[Load Custom Fonts]
  F --> G[Render Home Page]
  G --> H[End Page Flow]
  I[External Service] --> J[Send Webhook]
  J --> K[Receive Webhook Route]
  K --> L{Payload Valid}
  L -->|Yes| M[Process Webhook]
  L -->|No| N[Reject Request]
  M --> O[Return Success]
  N --> O
  O --> P[End Webhook Flow]