import { defineCard } from "../define.js";

// EDHREC rank 29080.
//
// Rulings:
//   [2004-12-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.

const TEXT = "Whenever you cast a Spirit or Arcane spell, target land becomes a 3/3 creature until end of turn. It's still a land.";

export default defineCard({
  name: "Soilshaper",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["land"],
      effect: { kind: "animate", target: 0, power: 3, toughness: 3, addTypes: ["creature"], addSubtypes: [], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
