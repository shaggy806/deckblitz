import { defineCard } from "../define.js";

// EDHREC rank 9531.
export default defineCard({
  name: "Curious Farm Animals",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Boar", "Elk", "Bird", "Ox"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, you gain 3 life.\n{2}, Sacrifice this creature: Destroy up to one target artifact or enchantment.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}, Sacrifice this creature: Destroy up to one target artifact or enchantment.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature dies, you gain 3 life.",
    },
  ],
});
