import { defineCard } from "../define.js";

// EDHREC rank 25090.
//
// Rulings:
//   [2009-10-01] A different opposing player may be targeted each time the ability is activated.
//   [2009-10-01] It is only necessary that the condition be true as you activate the ability. The
//     ability will still resolve normally even if the condition is no longer true at that time.

export default defineCard({
  name: "Keeper of the Dead",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{B}, {T}: Choose target opponent who has at least two fewer creature cards in their graveyard than you do as you activate this ability. Destroy target nonblack creature that player controls.",
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [
        { kind: "opponent-compared", stat: "creature-cards-in-graveyard", by: 2, fewer: true },
        { kind: "other", than: { slot: 0 }, sameController: true, of: "nonblack-creature" },
      ],
      effect: { kind: "destroy", target: 1 },
      resolve: null,
      text: "{B}, {T}: Choose target opponent who has at least two fewer creature cards in their graveyard than you do as you activate this ability. Destroy target nonblack creature that player controls.",
    },
  ],
});
