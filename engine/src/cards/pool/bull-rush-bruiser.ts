import { defineCard } from "../define.js";

// EDHREC rank 26296. Battlebond. "Your team" is "you" outside a team game
// (rule 102.4).
//
// Rulings:
//   [2018-06-08] Whether your team controls another Warrior is checked as Bull-Rush Bruiser's
//     triggered ability triggers and again as it resolves. Once it gains first strike this way, it
//     won't lose it, even if your team loses its other Warriors.
const TEXT =
  "Whenever this creature attacks, if your team controls another Warrior, this creature gains first strike until end of turn.";

export default defineCard({
  name: "Bull-Rush Bruiser",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Warrior" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
