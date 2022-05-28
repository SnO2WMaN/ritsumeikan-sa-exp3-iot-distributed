let Edge
    : Type
    = { id : Text }

let Loader
    : Type
    = { id : Text }

let edges
    : List Edge
    = [ { id = "14cb948d-5428-441f-a9a4-05f41ffe5271" }
      , { id = "01108f00-a3ed-4c00-bde8-494217ff05b8" }
      , { id = "0fe42562-7640-4ada-846f-698f74d3520b" }
      , { id = "ad405cc0-4f1a-4089-b5ef-4c12c114bff9" }
      , { id = "6fdee513-a484-42eb-b68c-5e6f3a950272" }
      , { id = "cf0f3bae-5444-426c-b819-c56e0f6ba56e" }
      , { id = "eeb3c573-40c0-42ab-bf72-e21ae5874503" }
      ]

let loaders
    : List Loader
    = [ { id = "f5a733e4-9cc5-4618-8210-5e433c8187b3" }
      , { id = "3c9c9a42-604c-4c4e-8188-4805140ebf5b" }
      , { id = "56dcbc69-7234-445c-a652-479d24950d1f" }
      ]

in  { Edge, edges, Loader, loaders }
