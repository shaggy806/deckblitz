import { defineCard } from "../define.js";

export default defineCard({
  name: "Consume the Meek",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy each creature with mana value 3 or less. They can't be regenerated.",
  effect: {
    kind: "destroy-all",
    filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    cantBeRegenerated: true,
  },
});
