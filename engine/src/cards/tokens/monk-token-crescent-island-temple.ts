import { defineCard } from "../define.js";

// Crescent Island Temple's Monk token.

export default defineCard({
  name: "Monk Token (Crescent Island Temple)",
  art: "e49c80ac-5c90-4fd2-ad40-cc77af160f64",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Monk"],
  power: 1,
  toughness: 1,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
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
