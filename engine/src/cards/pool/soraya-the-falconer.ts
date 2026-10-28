import { defineCard } from "../define.js";

// EDHREC rank 19611.
//
// Rulings:
//   [2008-10-01] A maximum of one nonbanding creature can join an attacking band no matter how
//     many creatures with banding are in it.
//   [2008-10-01] Creatures in the same band must all attack the same player or planeswalker.
//   [2008-10-01] If a creature with banding attacks, it can team up with any number of other
//     attacking creatures with banding (and up to one nonbanding creature) and attack as a unit
//     called a "band." The band can be blocked by any creature that could block a single creature
//     in the band. Blocking any creature in a band blocks the entire band. If a creature with
//     banding is blocked, the attacking player chooses how the blockers' damage is assigned.
//   [2009-10-01] If a creature in combat has banding, its controller assigns damage for creatures
//     blocking or blocked by it.

export default defineCard({
  name: "Soraya the Falconer",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: "Bird creatures get +1/+1.\n{1}{W}: Target Bird creature gains banding until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding a player controls are blocking or being blocked by a creature, that player divides that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Bird" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: Target Bird creature gains banding until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Bird" } },
      grantPt: [1, 1],
      text: "Bird creatures get +1/+1.",
    },
  ],
});
