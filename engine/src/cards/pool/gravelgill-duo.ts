import { defineCard } from "../define.js";

// EDHREC rank 30037. A spell that's both colours fires both triggers (the
// ruling).

export default defineCard({
  name: "Gravelgill Duo",
  manaCost: "{2}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Whenever you cast a blue spell, this creature gets +1/+1 until end of turn.\nWhenever you cast a black spell, this creature gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a blue spell, this creature gets +1/+1 until end of turn.",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "fear", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a black spell, this creature gains fear until end of turn.",
    },
  ],
});
