import { defineCard } from "../define.js";

// EDHREC rank 31108.

export default defineCard({
  name: "Spitting Hydra",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: "This creature enters with four +1/+1 counters on it.\n{1}{R}, Remove a +1/+1 counter from this creature: It deals 1 damage to target creature.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}, Remove a +1/+1 counter from this creature: It deals 1 damage to target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "This creature enters with four +1/+1 counters on it.",
    },
  ],
});
