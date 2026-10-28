import { defineCard } from "../define.js";

// EDHREC rank 25561.
//
// Rulings:
//   [2004-10-04] It does prevent damage from animated Deserts in combat.
//   [2008-10-01] A maximum of one nonbanding creature can join an attacking band no matter how
//     many creatures with banding are in it.
//   [2008-10-01] If a creature with banding attacks, it can team up with any number of other
//     attacking creatures with banding (and up to one nonbanding creature) and attack as a unit
//     called a "band." The band can be blocked by any creature that could block a single creature
//     in the band. Blocking any creature in a band blocks the entire band. If a creature with
//     banding is blocked, the attacking player chooses how the blockers' damage is assigned.
//   [2008-10-01] Creatures in the same band must all attack the same player or planeswalker.
//   [2009-10-01] If a creature in combat has banding, its controller assigns damage for creatures
//     blocking or blocked by it.

export default defineCard({
  name: "Camel",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Camel"],
  power: 0,
  toughness: 1,
  keywords: ["banding"],
  text: "Banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\nAs long as this creature is attacking, prevent all damage Deserts would deal to this creature and to creatures banded with this creature.",
  // Desert Nomads' prevention, while it attacks, to it and to its band
  // (`bandedWithSource` — rule 702.22).
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { subtype: "Desert" } },
      text: "As long as this creature is attacking, prevent all damage Deserts would deal to this creature and to creatures banded with this creature.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        toFilter: { type: "creature", bandedWithSource: true },
        source: { subtype: "Desert" },
      },
      text: "As long as this creature is attacking, prevent all damage Deserts would deal to this creature and to creatures banded with this creature.",
    },
  ],
});
