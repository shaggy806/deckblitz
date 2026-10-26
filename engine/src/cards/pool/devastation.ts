import { defineCard } from "../define.js";

// EDHREC rank 17523.

export default defineCard({
  name: "Devastation",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all creatures and lands.",
  targets: [],
  effect: { kind: "destroy-all", filter: { typesAnyOf: ["creature", "land"] } },
});
