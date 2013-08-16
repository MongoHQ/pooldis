// our command dsl for setting up pooldis
module.exports = [
  {
    command: "SET",
    method: "set",
    connection: "pipeline"
  },
  {
    command: "HMSET",
    method: "hmset",
    connection: "pool",
    input_transformations: [
      {
        name: "flat_pairs",
        args: [1]
      }
    ]
  },
  {
    command: "HMGET",
    method: "hmget",
    connection: "pool",
    output_transformations: [
      {
        name: "object"
      }
    ]
  },
  {
    command: "SCRIPT EXISTS",
    method: "script_exists",
    input_transformations: [
      {
        name: "unzip",
        args: [2]
      }
    ]
  }
]