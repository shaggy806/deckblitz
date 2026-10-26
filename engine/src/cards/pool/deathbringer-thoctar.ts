import { defineCard } from "../define.js";

// EDHREC rank 12579. Algae Gharial's trigger and Triskelion's ping.
//
// Rulings:
//   Dying alongside another creature, it still triggers but gets no counter.
//   Any +1/+1 counter may pay for the ping, not only one it put on itself.

const GROW_TEXT = "Whenever another creature dies, you may put a +1/+1 counter on this creature.";
const PING_TEXT = "Remove a +1/+1 counter from this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Deathbringer Thoctar",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Beast"],
  power: 3,
  toughness: 3,
  text: `${GROW_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Deathbringer Thoctar?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
