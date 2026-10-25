import { defineCard } from "../define.js";

// The Devil Token carries the dies trigger the spell gives them.
export default defineCard({
  name: "Dance with Devils",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Create two 1/1 red Devil creature tokens. They have \"When this token dies, it deals 1 damage to any target.\"",
  effect: { kind: "create-token", token: "Devil Token", count: 2 },
});
