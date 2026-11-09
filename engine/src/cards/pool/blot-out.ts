import { defineCard } from "../define.js";

// The shape of End of the Hunt, same text: the chooser is the target opponent.
export default defineCard({
  name: "Blot Out",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
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
