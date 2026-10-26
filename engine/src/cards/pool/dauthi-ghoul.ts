import { defineCard } from "../define.js";

// EDHREC rank 15332.

const GROW_TEXT = "Whenever a creature with shadow dies, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Dauthi Ghoul",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Zombie"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", keyword: "shadow" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
