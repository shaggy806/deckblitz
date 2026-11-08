import { defineCard } from "../define.js";

// EDHREC rank 2613.
//
// Rulings:
//   [2004-12-01] The lands are tapped and untapped once each time combat damage is dealt (usually
//     once each turn, but first strike, double strike, and multiple combat phases can change
//     that), not once for each creature that deals combat damage.

export default defineCard({
  name: "Nature's Will",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever one or more creatures you control deal combat damage to a player, tap all lands that player controls and untap all lands you control.",
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap-all", filter: { type: "land", controlledByRef: "trigger-player" } },
          { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
        ],
      },
      resolve: null,
      text: "Whenever one or more creatures you control deal combat damage to a player, tap all lands that player controls and untap all lands you control.",
    },
  ],
});
