import { defineCard } from "../define.js";

export default defineCard({
  name: "Legion Extruder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: "When this artifact enters, it deals 2 damage to any target.\n{2}, {T}, Sacrifice another artifact: Create a 3/3 colorless Golem artifact creature token.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "create-token", token: "Golem Token (Golem Foundry)", count: 1 },
      resolve: null,
      text: "{2}, {T}, Sacrifice another artifact: Create a 3/3 colorless Golem artifact creature token.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 2 damage to any target.",
    },
  ],
});
