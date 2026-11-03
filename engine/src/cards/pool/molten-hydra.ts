import { defineCard } from "../define.js";

const PUMP_TEXT = "{1}{R}{R}: Put a +1/+1 counter on this creature.";
const SHOOT_TEXT =
  "{T}, Remove all +1/+1 counters from this creature: It deals damage to any target equal to the number of +1/+1 counters removed this way.";

export default defineCard({
  name: "Molten Hydra",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 1,
  toughness: 1,
  text: `${PUMP_TEXT}\n${SHOOT_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "+1/+1", count: "all" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: SHOOT_TEXT,
    },
  ],
});
