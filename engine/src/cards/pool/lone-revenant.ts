import { defineCard } from "../define.js";

// EDHREC rank 30394.
//
// Rulings:
//   [2012-05-01] If you control Lone Revenant and any other creature (including another Lone
//     Revenant), its ability won't trigger — an intervening-if, checked as combat damage is
//     dealt (before state-based actions remove creatures that died to it) and again on
//     resolution.
//   [2012-05-01] You must put one of the cards into your hand.

const TEXT =
  "Whenever this creature deals combat damage to a player, if you control no other creatures, look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Lone Revenant",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["hexproof"],
  text: `Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeSelf: true },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
