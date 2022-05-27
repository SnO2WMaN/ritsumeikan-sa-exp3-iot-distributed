let Compose =
      https://raw.githubusercontent.com/SnO2WMaN/dhall-docker-compose/master/compose/v3/package.dhall

let rabbitmqService =
      Compose.Service::{
      , image = Some "rabbitmq:3.9"
      , environment = Some
          ( Compose.ListOrDict.Dict
              ( toMap
                  { RABBITMQ_DEFAULT_USER = "user"
                  , RABBITMQ_DEFAULT_PASS = "pass"
                  }
              )
          )
      , networks = Some (Compose.Networks.List [ "test" ])
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
                  { MONGO_INITDB_ROOT_USERNAME = "user"
                  , MONGO_INITDB_ROOT_PASSWORD = "user"
                  , MONGO_INITDB_DATABASE = "user"
                  }
              )
          )
      , networks = Some (Compose.Networks.List [ "test" ])
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
