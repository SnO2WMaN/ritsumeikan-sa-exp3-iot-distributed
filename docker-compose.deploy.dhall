let Compose = ./dhall/docker-compose/compose/v3/package.dhall

let Nodes = ./docker-compose.deploy.nodes.dhall

let List/concat = https://prelude.dhall-lang.org/List/concat

let List/map = https://prelude.dhall-lang.org/List/map

let Map/Entry = https://prelude.dhall-lang.org/Map/Entry

let JSON = https://prelude.dhall-lang.org/JSON/package.dhall

let edgeServices =
      List/map
        Nodes.Edge
        (Map/Entry Text Compose.Service.Type)
        ( \(edge : Nodes.Edge) ->
            { mapKey = "edge_" ++ edge.id
            , mapValue = Compose.Service::{
              , build = Some Compose.Build::{
                , context = Some "./edge"
                , dockerfile = Some "Dockerfile"
                }
              , command = Some
                  ( Compose.StringOrList.List
                      [ "--rabbitmqUrl"
                      , "amqp://user:pass@rabbitmq:5672"
                      , "--id"
                      , edge.id
                      , "--params"
                      , JSON.renderCompact
                          ( JSON.object
                              ( toMap
                                  { floor = JSON.integer edge.params.floor
                                  , min = JSON.double edge.params.min
                                  , max = JSON.double edge.params.max
                                  }
                              )
                          )
                      ]
                  )
              , networks = Some (Compose.Networks.List [ "test" ])
              , depends_on = Some
                  ( Compose.DependsOn.Long
                      (toMap { rabbitmq.condition = "service_healthy" })
                  )
              }
            }
        )
        Nodes.edges

let loaderServices =
      List/map
        Nodes.Loader
        (Map/Entry Text Compose.Service.Type)
        ( \(loader : Nodes.Loader) ->
            { mapKey = "loader_" ++ loader.id
            , mapValue = Compose.Service::{
              , build = Some Compose.Build::{
                , context = Some "./loader"
                , dockerfile = Some "Dockerfile"
                }
              , command = Some
                  ( Compose.StringOrList.List
                      [ "--rabbitmqUrl"
                      , "amqp://user:pass@rabbitmq:5672"
                      , "--mongoUrl"
                      , "mongodb://user:pass@mongo:27017/db?authSource=admin"
                      ]
                  )
              , networks = Some (Compose.Networks.List [ "test" ])
              , depends_on = Some
                  ( Compose.DependsOn.Long
                      ( toMap
                          { rabbitmq.condition = "service_healthy"
                          , mongo.condition = "service_healthy"
                          }
                      )
                  )
              }
            }
        )
        Nodes.loaders

let webapiService =
      Compose.Service::{
      , build = Some Compose.Build::{
        , context = Some "./web-api"
        , dockerfile = Some "Dockerfile"
        }
      , command = Some
          ( Compose.StringOrList.List
              [ "--mongoUrl"
              , "mongodb://user:pass@mongo:27017/db?authSource=admin"
              ]
          )
      , environment = Some
          ( Compose.ListOrDict.Dict
              (toMap { PORT = Compose.StringOrNumber.Number 4000 })
          )
      , networks = Some (Compose.Networks.List [ "test" ])
      , ports = Some
          ( Compose.Ports.Long
              [ { published = Compose.StringOrNumber.Number 8081
                , target = Compose.StringOrNumber.Number 4000
                }
              ]
          )
      , depends_on = Some
          ( Compose.DependsOn.Long
              (toMap { mongo.condition = "service_healthy" })
          )
      }

let webviewService =
      Compose.Service::{
      , build = Some Compose.Build::{
        , context = Some "./web-view"
        , dockerfile = Some "Dockerfile"
        , args = Some
            ( Compose.ListOrDict.Dict
                ( toMap
                    { vite_http_endpoint =
                        Compose.StringOrNumber.String "http://localhost:8081"
                    }
                )
            )
        }
      , networks = Some (Compose.Networks.List [ "test" ])
      , ports = Some
          ( Compose.Ports.Long
              [ { published = Compose.StringOrNumber.Number 8080
                , target = Compose.StringOrNumber.Number 80
                }
              ]
          )
      , depends_on = Some
          ( Compose.DependsOn.Long
              (toMap { webapi.condition = "service_started" })
          )
      }

let rabbitmqService =
      Compose.Service::{
      , image = Some "rabbitmq:3.9"
      , environment = Some
          ( Compose.ListOrDict.Dict
              ( toMap
                  { RABBITMQ_DEFAULT_USER = Compose.StringOrNumber.String "user"
                  , RABBITMQ_DEFAULT_PASS = Compose.StringOrNumber.String "pass"
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
                  { MONGO_INITDB_ROOT_USERNAME =
                      Compose.StringOrNumber.String "user"
                  , MONGO_INITDB_ROOT_PASSWORD =
                      Compose.StringOrNumber.String "pass"
                  , MONGO_INITDB_DATABASE = Compose.StringOrNumber.String "db"
                  }
              )
          )
      , networks = Some (Compose.Networks.List [ "test" ])
      , ports = Some
          ( Compose.Ports.Long
              [ { published = Compose.StringOrNumber.Number 27018
                , target = Compose.StringOrNumber.Number 27017
                }
              ]
          )
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
    = List/concat
        (Map/Entry Text Compose.Service.Type)
        [ toMap
            { rabbitmq = rabbitmqService
            , mongo = mongoService
            , webapi = webapiService
            , webview = webviewService
            }
        , edgeServices
        , loaderServices
        ]

let networks
    : Compose.TopLevelNetworks
    = toMap { test = Some {=} }

in  Compose.Config::{
    , version = "3.9"
    , services = Some services
    , networks = Some networks
    }
