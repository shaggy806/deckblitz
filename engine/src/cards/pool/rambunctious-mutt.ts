import { defineCard } from "../define.js";

export default defineCard({
  name: "Rambunctious Mutt",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, destroy target artifact or enchantment an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["artifact", "enchantment"] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target artifact or enchantment an opponent controls.",
    },
  ],
});
