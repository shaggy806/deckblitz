import { defineCard } from "../define.js";

// EDHREC rank 25204. Clot Sliver's shape: every Sliver, whoever controls it,
// gets the activated ability; the type is chosen as it resolves
// (`choose-creature-type`) and added to the Sliver that has it.
//
// Rulings:
//   [2004-10-04] Unlike most type changing effects, this one adds a creature type instead of
//     replacing existing creature types.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.

const GRANTED_TEXT =
  "{1}: This permanent becomes the creature type of your choice in addition to its other types until end of turn.";
const TEXT = `All Slivers have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Mistform Sliver",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Sliver"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false },
          targets: [],
          effect: {
            kind: "choose-creature-type",
            then: { kind: "add-types", target: "source", addSubtypes: ["$chosen"], duration: "end-of-turn" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
