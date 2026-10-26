import { defineCard } from "../define.js";

const HELLBENT =
  "Hellbent — {1}{R}, {T}: This land deals 1 damage to any target. Activate only if you have no cards in hand.";

export default defineCard({
  name: "Keldon Megaliths",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {R}.\n${HELLBENT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{1}{R}", tap: true },
      // Checked as it's activated only (the ruling).
      condition: { kind: "hand-size", atMost: 0 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: HELLBENT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
