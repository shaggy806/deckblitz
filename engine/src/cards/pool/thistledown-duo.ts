import { defineCard } from "../define.js";

// EDHREC rank 30786. A spell that's both colours fires both triggers (the
// ruling).

export default defineCard({
  name: "Thistledown Duo",
  manaCost: "{2}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Whenever you cast a white spell, this creature gets +1/+1 until end of turn.\nWhenever you cast a blue spell, this creature gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a white spell, this creature gets +1/+1 until end of turn.",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a blue spell, this creature gains flying until end of turn.",
    },
  ],
});
