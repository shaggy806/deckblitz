import { defineCard } from "../define.js";

// EDHREC rank 23729.
//
// "Put into a graveyard" (not "dies") is a `leaves-battlefield` of the
// enchanted permanent to a graveyard, read as it last existed (Kaya's
// Ghostform's shape), so it fires whether or not it was still a creature.
//
// Rulings:
//   [2017-02-09] An artifact that becomes a creature due to Tezzeret's Touch can't attack unless
//     you've controlled it continuously since your turn began.
//   [2017-02-09] A Vehicle enchanted by Tezzeret's Touch becomes a 5/5 creature. Crewing it won't
//     change its power and toughness.
//   [2017-02-09] If the enchanted artifact is an Equipment, it becomes unattached and it can't be
//     attached to anything for as long as it remains a creature.
//   [2017-02-09] An artifact creature enchanted by Tezzeret's Touch becomes 5/5 instead of its
//     normal power and toughness.

const ANIMATE =
  "Enchanted artifact is a creature with base power and toughness 5/5 in addition to its other types.";
const RETURN = "When enchanted artifact is put into a graveyard, return that card to its owner's hand.";

export default defineCard({
  name: "Tezzeret's Touch",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${ANIMATE}\n${RETURN}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      text: ANIMATE,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
