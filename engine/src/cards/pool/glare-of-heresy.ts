import { defineCard } from "../define.js";

// EDHREC rank 23704.

export default defineCard({
  name: "Glare of Heresy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target white permanent.",
  targets: [{ kind: "permanent", filter: { colors: ["W"] } }],
  effect: { kind: "exile", target: 0 },
});
