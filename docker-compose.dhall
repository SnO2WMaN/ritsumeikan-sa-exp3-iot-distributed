let Compose = ./dhall/docker-compose/compose/v3/package.dhall

let List/concat = https://prelude.dhall-lang.org/List/concat

let List/map = https://prelude.dhall-lang.org/List/map

let Map/Entry = https://prelude.dhall-lang.org/Map/Entry

let rabbitmqService =
      Compose.Service::{
      , image = Some "rabbitmq:3.9-management"
      , environment = Some
          ( Compose.ListOrDict.Dict
              ( toMap
                  { RABBITMQ_DEFAULT_USER = "$RABBITMQ_USERNAME"
                  , RABBITMQ_DEFAULT_PASS = "$RABBITMQ_PASSWORD"
                  }
              )
          )
      , networks = Some (Compose.Networks.List [ "test" ])
      , ports = Some
          ( Compose.Ports.Long
              [ { published = Compose.StringOrNumber.String "$RABBITMQ_PORT"
                , target = Compose.StringOrNumber.Number 5672
                }
              , { published = Compose.StringOrNumber.Number 15672
                , target = Compose.StringOrNumber.Number 15672
                }
              ]
          )
      , healthcheck = Some Compose.Healthcheck::{
        , test = Some
            (Compose.StringOrList.String "rabbitmq-diagnostics -q ping")
        , interval = Some "5s"
        , timeout = Some "10s"
        , retries = Some 10
        }
      }

let mongoService =
      Compose.Service::{
      , image = Some "mongo:5.0"
      , environment = Some
          ( Compose.ListOrDict.Dict
              ( toMap
                  { MONGO_INITDB_ROOT_USERNAME =  "$MONGO_USERNAME"
                  , MONGO_INITDB_ROOT_PASSWORD =  "$MONGO_PASSWORD"
                  , MONGO_INITDB_DATABASE = "$MONGO_DATABASE"
                  }
              )
          )
      , networks = Some (Compose.Networks.List [ "test" ])
      , ports = Some
          (Compose.Ports.Long [ { published = Compose.StringOrNumber.String "$MONGO_PORT", target =  Compose.StringOrNumber.Number 27017 } ])
      , healthcheck = Some Compose.Healthcheck::{
        , test = Some
            ( Compose.StringOrList.String
                "echo 'db.runCommand(\"ping\").ok' | mongo mongo:27017/test --quiet"
            )
        , interval = Some "5s"
        , timeout = Some "10s"
        , retries = Some 10
        }
      }

let services
    : Compose.Services
    = toMap { rabbitmq = rabbitmqService, mongo = mongoService }

let networks
    : Compose.TopLevelNetworks
    = toMap { test = Some {=} }

in  Compose.Config::{
    , version = "3.9"
    , services = Some services
    , networks = Some networks
    }
