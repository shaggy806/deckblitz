import { defineCard } from "../define.js";

export default defineCard({
  name: "Illumination",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Counter target artifact or enchantment spell. Its controller gains life equal to its mana value.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "gain-life", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
    ],
  },
});
