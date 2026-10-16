import { defineCard } from "../define.js";

// Ral and the Implicit Maze's token: a copy of the card Spellgorger Weird
// (the ruling), so it has that card's name and its {2}{R} mana cost (mana
// value 3). "Spellgorger Weird" is the pool card's key, so this one is keyed
// " Token" and named by `tokenName` (Ajani's Pridemate Token).

export default defineCard({
  name: "Spellgorger Weird Token",
  tokenName: "Spellgorger Weird",
  art: "33b63bd0-0b61-4a87-928f-95fc6b5a3150",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 2,
  toughness: 2,
  text: "Whenever you cast a noncreature spell, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put a +1/+1 counter on this creature.",
    },
  ],
});
