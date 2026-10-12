import { defineCard } from "../define.js";

export default defineCard({
  name: "Smother",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature with mana value 3 or less. It can't be regenerated.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
