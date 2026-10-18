import { defineCard } from "../define.js";

// EDHREC rank 21522.
//
// Rulings:
//   [2023-04-14] All effects of Glistening Deluge are determined as it resolves. Creatures that
//     enter the battlefield later in the turn won't get -1/-1 or -3/-3, nor will noncreature
//     permanents that become creatures. A creature that gets -1/-1 won't get an additional -2/-2
//     if it later becomes green and/or white. A green and/or white creature that gets -3/-3 won't
//     have the -2/-2 rescinded if it later stops being green and white.
//
// Two `modify-pt-all`s, each fixing its set of creatures as it applies (rule
// 611.2c); "green and/or white" is an `anyOf` of the two colours.

export default defineCard({
  name: "Glistening Deluge",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -1/-1 until end of turn. Creatures that are green and/or white get an additional -2/-2 until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature" }, power: -1, toughness: -1, duration: "end-of-turn" },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
    ],
  },
});
