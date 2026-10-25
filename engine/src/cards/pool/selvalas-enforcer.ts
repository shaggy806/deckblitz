import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 25115.
export default defineCard({
  name: "Selvala's Enforcer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Parley — When this creature enters, each player reveals the top card of their library. For each nonland card revealed this way, put a +1/+1 counter on this creature. Then each player draws a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: parley({ kind: "add-counter", target: "source", counter: "+1/+1", amount: PARLEY_NONLAND }),
      resolve: null,
      text: "Parley — When this creature enters, each player reveals the top card of their library. For each nonland card revealed this way, put a +1/+1 counter on this creature. Then each player draws a card.",
    },
  ],
});
