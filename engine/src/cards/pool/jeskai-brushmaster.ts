import { defineCard } from "../define.js";

export default defineCard({
  name: "Jeskai Brushmaster",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Monk"],
  power: 2,
  toughness: 4,
  keywords: ["double-strike"],
  text: "Double strike\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
  ],
});
