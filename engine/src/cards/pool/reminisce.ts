import { defineCard } from "../define.js";

export default defineCard({
  name: "Reminisce",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player shuffles their graveyard into their library.",
  targets: ["player"],
  effect: { kind: "shuffle-graveyard-into-library", target: 0 },
});
