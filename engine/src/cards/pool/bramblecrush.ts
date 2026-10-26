import { defineCard } from "../define.js";

// EDHREC rank 17764.

export default defineCard({
  name: "Bramblecrush",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target noncreature permanent.",
  targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
  effect: { kind: "destroy", target: 0 },
});
