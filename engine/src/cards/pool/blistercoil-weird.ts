import { defineCard } from "../define.js";

// EDHREC rank 22895.
//
// Rulings:
//   [2012-10-01] Blistercoil Weird will get +1/+1 even if the instant or sorcery spell is
//     countered or if Blistercoil Weird is untapped when its ability resolves.
//   [2012-10-01] Blistercoil Weird will get +1/+1 and untap before that instant or sorcery spell
//     resolves.
//   [2012-10-01] If you copy an instant or sorcery spell on the stack, the copy isn't cast.
//     Blistercoil Weird's ability won't trigger.

export default defineCard({
  name: "Blistercoil Weird",
  manaCost: "{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 1,
  toughness: 1,
  text: "Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. Untap it.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "untap", target: "source" },
        ],
      },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. Untap it.",
    },
  ],
});
