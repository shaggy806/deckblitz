import { defineCard } from "../define.js";

// EDHREC rank 15151.
//
// Gratuitous Violence's replacement: damage from a creature source you
// control, to any permanent or player, doubled.

const TEXT = "Double all damage that creature sources you control would deal.";

export default defineCard({
  name: "Absorbing Man and Titania",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 4,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        multiplier: 2,
        source: { type: "creature", controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
