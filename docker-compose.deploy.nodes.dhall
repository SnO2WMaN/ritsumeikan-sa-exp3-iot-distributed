let Edge
    : Type
    = { id : Text, params : { min : Double, max : Double, floor : Integer } }

let Loader
    : Type
    = { id : Text }

let edges
    : List Edge
    = [ { id = "14cb948d-5428-441f-a9a4-05f41ffe5271"
        , params = { floor = +3, min = 1020.00, max = 1020.50 }
        }
      , { id = "01108f00-a3ed-4c00-bde8-494217ff05b8"
        , params = { floor = +3, min = 1020.05, max = 1020.55 }
        }
      , { id = "ad405cc0-4f1a-4089-b5ef-4c12c114bff9"
        , params = { floor = +2, min = 1020.40, max = 1020.90 }
        }
      , { id = "6fdee513-a484-42eb-b68c-5e6f3a950272"
        , params = { floor = +2, min = 1020.45, max = 1020.95 }
        }
      , { id = "cf0f3bae-5444-426c-b819-c56e0f6ba56e"
        , params = { floor = +1, min = 1020.80, max = 1021.30 }
        }
      , { id = "eeb3c573-40c0-42ab-bf72-e21ae5874503"
        , params = { floor = +1, min = 1020.85, max = 1021.35 }
        }
      ]

let loaders
    : List Loader
    = [ { id = "f5a733e4-9cc5-4618-8210-5e433c8187b3" }
      , { id = "3c9c9a42-604c-4c4e-8188-4805140ebf5b" }
      , { id = "56dcbc69-7234-445c-a652-479d24950d1f" }
      ]

in  { Edge, edges, Loader, loaders }
