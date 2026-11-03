import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 475.
//
// Rulings: a commander with no colors in its color identity gets protection
// from each color; with no commander, no protection, and still +3/+3; with two
// commanders, each color not in their combined identity.
//
// "Equip commander {3}" as Unstable Molecule Suit's, beside the ordinary Equip {5}.

const STATIC_TEXT = "Equipped creature gets +3/+3 and has protection from each color that's not in your commander's color identity.";

export default defineCard({
  name: "Commander's Plate",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip commander {3}\nEquip {5}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      protection: { outsideCommanderIdentity: true },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", isCommander: true } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip commander {3}",
      sorcerySpeed: true,
    },
    equip("{5}"),
  ],
});
