import { defineCard } from "../define.js";

// EDHREC rank 19981. It doesn't trigger on its own casting: it's on the stack,
// not the battlefield, then (the ruling).

export default defineCard({
  name: "Sol'kanar the Swamp King",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["swampwalk"],
  text: "Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\nWhenever a player casts a black spell, you gain 1 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a player casts a black spell, you gain 1 life.",
    },
  ],
});
