# Roxzave API Endpoints

Base URL: `http://localhost:8000`  
Swagger: `http://localhost:8000/docs`

## Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/guest` | Guest session |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset password |

## User
| GET/PATCH | `/api/user/profile` | Profile |
| GET/POST | `/api/user/vehicles` | Vehicles |
| GET/POST/PATCH/DELETE | `/api/user/emergency-contacts` | Contacts |

## Trips
| GET | `/api/trips` | Trip list |
| GET | `/api/trips/driving-score` | Driving analytics |

## SOS
| GET | `/api/sos/emergency-numbers` | National numbers |
| POST | `/api/sos` | Trigger SOS |
| GET | `/api/sos/history` | History |

## Community
| GET/POST | `/api/community/posts` | Feed |
| GET | `/api/community/posts/{id}` | Detail |
| POST | `/api/community/posts/{id}/verify` | Verify |
| GET/POST | `/api/community/posts/{id}/comments` | Comments |

## Maps
| GET | `/api/maps/nearby/petrol-stations` | Petrol |
| GET | `/api/maps/nearby/hospitals` | Hospitals |
| GET | `/api/maps/layers` | Safety layers |
| POST | `/api/maps/fuel-cost-estimate` | Fuel calculator |

## Notifications
| GET | `/api/notifications` | List |
| PATCH | `/api/notifications/{id}/read` | Mark read |
| POST | `/api/notifications/read-all` | Mark all |

## Device (ESP32)
| POST | `/api/device/register` | Register |
| POST | `/api/device/telemetry` | Telemetry |
| POST | `/api/device/crash-event` | Crash |
| POST | `/api/device/pothole-event` | Pothole |
| GET | `/api/device/status/{device_id}` | Status |

## Safety
| GET | `/api/safety/drowsiness/events` | Drowsiness |
| GET | `/api/safety/crash/events` | Crashes |
| GET | `/api/safety/pothole/reports` | Potholes |
| GET | `/api/safety/golden-hour/status` | Golden hour |
| GET | `/api/safety/trauma/guidance` | Trauma steps |
| GET | `/api/safety/women/events` | Women safety |

## Navigation
| POST | `/api/navigation/safe-route` | Safe route score |
| GET | `/api/navigation/toll/estimate` | Toll estimate |
| GET | `/api/navigation/traffic-laws` | Traffic laws |
| GET | `/api/navigation/emergency-network` | Hospitals/police/blood |

## Admin
| GET | `/api/admin/analytics/overview` | Stats |
| GET | `/api/admin/sos/monitor` | SOS feed |
| GET | `/api/admin/users` | Users |

## Analytics
| GET | `/api/analytics/driver` | Driver stats |
| GET | `/api/analytics/safety` | Safety stats |

## AI
| GET | `/api/ai/{module}/recommendations` | Recommendations |

## Auth (PRD paths — also under `/api/auth`)
| POST | `/auth/login` | Login |
| POST | `/auth/signup` | Signup |
| POST | `/auth/guest` | Guest |
| POST | `/auth/refresh` | Refresh |

## WebSocket
| WS | `/ws/guardian/{user_id}` | Guardian tracking |
| WS | `/ws/{channel}` | Generic channel |
