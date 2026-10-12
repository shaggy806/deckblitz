import { defineCard } from "../define.js";

export default defineCard({
  name: "Steel Wrecking Ball",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, it deals 5 damage to target creature.\n{1}{R}, Discard this card: Destroy target artifact.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{1}{R}, Discard this card: Destroy target artifact.",
      zone: "hand",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 5 damage to target creature.",
    },
  ],
});
