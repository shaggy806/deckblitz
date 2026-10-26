import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 15281. Goblin Bomb's upkeep flip with +1/+1
// counters; a lost flip with no counter left removes nothing.

const UPKEEP =
  "At the beginning of your upkeep, you may flip a coin. If you win the flip, put a +1/+1 counter on this creature. If you lose the flip, remove a +1/+1 counter from this creature.";

export default defineCard({
  name: "Chaotic Goo",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: `This creature enters with three +1/+1 counters on it.\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Flip a coin for Chaotic Goo?",
        effect: {
          kind: "flip-coin",
          won: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          lost: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
