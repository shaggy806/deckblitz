import { defineCard } from "../define.js";

// EDHREC rank 14324.
const TEXT = "When this creature dies, target opponent discards a card at random.";

export default defineCard({
  name: "Black Cat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 1, random: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
