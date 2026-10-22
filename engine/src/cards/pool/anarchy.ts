import { defineCard } from "../define.js";

// EDHREC rank 23681.
export default defineCard({
  name: "Anarchy",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all white permanents.",
  targets: [],
  effect: { kind: "destroy-all", filter: { colors: ["W"] } },
});
