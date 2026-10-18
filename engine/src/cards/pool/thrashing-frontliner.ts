import { defineCard } from "../define.js";

// EDHREC rank 28750. March of the Machine.

const TEXT = "Whenever this creature attacks a battle, it gets +1/+1 until end of turn.";

export default defineCard({
  name: "Thrashing Frontliner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Lizard"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defender: "battle" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
