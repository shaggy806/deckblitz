import { defineCard } from "../define.js";

// EDHREC rank 21002.

export default defineCard({
  name: "Flashfires",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all Plains.",
  effect: { kind: "destroy-all", filter: { subtype: "Plains" } },
});
