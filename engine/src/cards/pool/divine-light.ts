import { defineCard } from "../define.js";

export default defineCard({
  name: "Divine Light",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Prevent all damage that would be dealt this turn to creatures you control.",
  targets: [],
  effect: { kind: "damage-rule", to: { permanents: { type: "creature", controlledBy: "you" } } },
});
