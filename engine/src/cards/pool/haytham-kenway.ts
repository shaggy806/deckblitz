import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 8912.
//
// Rulings:
//   [2024-07-05] Auras attached to creatures exiled with Haytham Kenway's last ability will be put
//     into their owners' graveyards. Any Equipment attached to them will become unattached and
//     remain on the battlefield. Any counters on the exiled creatures cease to exist. When those
//     creatures return to the battlefield, they will be new objects with no connection to the
//     cards that were exiled.
//   [2024-07-05] If Haytham Kenway leaves the battlefield before its last ability resolves, the
//     target creatures won't be exiled.
//   [2024-07-05] If a token is exiled with Haytham Kenway's last ability, it will cease to exist
//     and won't return to the battlefield.
// Protection from a creature type is Feline Sovereign's protection filter.
// "For each opponent, … up to one target creature that player controls" is one
// optional slot per seat (King Solomon's Frogs), exiled together until Haytham
// leaves (an O-Ring — `untilSourceLeaves` exiles nothing once he's gone, the
// second ruling), with the linked return.

const PROTECTION_TEXT = "Protection from Assassins";
const ANTHEM_TEXT = "Other Knights you control get +2/+2 and have protection from Assassins.";
const ENTER_TEXT =
  "When Haytham Kenway enters, for each opponent, exile up to one target creature that player controls until Haytham Kenway leaves the battlefield.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Haytham Kenway",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${PROTECTION_TEXT}\n${ANTHEM_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Assassin" } },
      text: PROTECTION_TEXT,
    },
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Knight" },
      grantPt: [2, 2],
      protection: { filter: { subtype: "Assassin" } },
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "exile", target: 1, untilSourceLeaves: true },
          { kind: "exile", target: 2, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When Haytham Kenway leaves the battlefield, return the exiled cards.",
    },
  ],
});
