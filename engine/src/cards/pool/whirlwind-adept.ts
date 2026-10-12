import { defineCard } from "../define.js";

export default defineCard({
  name: "Whirlwind Adept",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 4,
  toughness: 2,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
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
