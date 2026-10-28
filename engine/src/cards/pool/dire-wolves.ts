import { defineCard } from "../define.js";

// EDHREC rank 28032.
//
// Rulings:
//   [2008-10-01] If a creature with banding attacks, it can team up with any number of other
//     attacking creatures with banding (and up to one nonbanding creature) and attack as a unit
//     called a "band." The band can be blocked by any creature that could block a single creature
//     in the band. Blocking any creature in a band blocks the entire band. If a creature with
//     banding is blocked, the attacking player chooses how the blockers' damage is assigned.
//   [2008-10-01] Creatures in the same band must all attack the same player or planeswalker.
//   [2008-10-01] A maximum of one nonbanding creature can join an attacking band no matter how
//     many creatures with banding are in it.
//   [2009-10-01] If a creature in combat has banding, its controller assigns damage for creatures
//     blocking or blocked by it.

export default defineCard({
  name: "Dire Wolves",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: "This creature has banding as long as you control a Plains. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land", subtype: "Plains" }, atLeast: 1 },
      grantKeywords: ["banding"],
      text: "This creature has banding as long as you control a Plains.",
    },
  ],
});
