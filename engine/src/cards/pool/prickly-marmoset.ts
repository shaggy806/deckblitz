import { defineCard } from "../define.js";

// EDHREC rank 24059.

export default defineCard({
  name: "Prickly Marmoset",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Monkey"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nWhenever you cycle a card, this creature gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cycle a card, this creature gets +2/+0 until end of turn.",
    },
  ],
});
