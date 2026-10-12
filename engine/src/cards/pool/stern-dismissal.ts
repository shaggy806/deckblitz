import { defineCard } from "../define.js";

export default defineCard({
  name: "Stern Dismissal",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature or enchantment an opponent controls to its owner's hand.",
  targets: [
    {
      kind: "permanent",
      whose: "opponent",
      filter: { typesAnyOf: ["creature", "enchantment"] },
    },
  ],
  effect: { kind: "return-to-hand", target: 0 },
});
