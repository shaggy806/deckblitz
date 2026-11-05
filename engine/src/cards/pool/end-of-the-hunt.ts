import { defineCard } from "../define.js";

// EDHREC rank 16895.
//
// Rulings:
//   If the target opponent has multiple creatures and/or planeswalkers tied for the greatest mana
//   value, that player chooses which one to exile.

export default defineCard({
  name: "End of the Hunt",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent exiles a creature or planeswalker they control with the greatest mana value among creatures and planeswalkers they control.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: { target: 0 },
        for: {
          permanent: {
            typesAnyOf: ["creature", "planeswalker"],
            controlledBy: "you",
            greatestAmongItsController: { of: "mana-value", among: { typesAnyOf: ["creature", "planeswalker"] } },
          },
          own: true,
          prompt: "Choose a creature or planeswalker with the greatest mana value among those you control to exile",
        },
      },
      { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0 } },
    ],
  },
});
