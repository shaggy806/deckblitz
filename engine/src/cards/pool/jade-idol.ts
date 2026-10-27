import { defineCard } from "../define.js";

// EDHREC rank 30798.
//
// Rulings:
//   [2004-12-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.

const TEXT = "Whenever you cast a Spirit or Arcane spell, this artifact becomes a 4/4 Spirit artifact creature until end of turn.";

export default defineCard({
  name: "Jade Idol",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Spirit"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
