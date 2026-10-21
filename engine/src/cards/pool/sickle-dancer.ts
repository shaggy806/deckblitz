import { defineCard } from "../define.js";

// EDHREC rank 31437. Battlebond. "Your team" is "you" outside a team game
// (rule 102.4).
//
// Rulings:
//   [2018-06-08] Whether your team controls another Warrior is checked as Sickle Dancer's
//     triggered ability triggers and again as it resolves. Once it gets +1/+1 this way, it won't
//     lose it, even if your team loses its other Warriors.
const TEXT =
  "Whenever this creature attacks, if your team controls another Warrior, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Sickle Dancer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Warrior" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
