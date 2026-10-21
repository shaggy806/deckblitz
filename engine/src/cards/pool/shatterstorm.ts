import { defineCard } from "../define.js";

// EDHREC rank 17098.

export default defineCard({
  name: "Shatterstorm",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all artifacts. They can't be regenerated.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "artifact" }, cantBeRegenerated: true },
});
