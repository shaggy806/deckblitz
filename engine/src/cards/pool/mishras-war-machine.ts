import { defineCard } from "../define.js";

// EDHREC rank 26013.
//
// Rulings:
//   [2004-10-04] You may choose to take damage or to discard. You can't avoid taking damage if you
//     have no cards to discard.
//   [2008-10-01] Creatures in the same band must all attack the same player or planeswalker.
//   [2008-10-01] If a creature with banding attacks, it can team up with any number of other
//     attacking creatures with banding (and up to one nonbanding creature) and attack as a unit
//     called a "band." The band can be blocked by any creature that could block a single creature
//     in the band. Blocking any creature in a band blocks the entire band. If a creature with
//     banding is blocked, the attacking player chooses how the blockers' damage is assigned.
//   [2008-10-01] A maximum of one nonbanding creature can join an attacking band no matter how
//     many creatures with banding are in it.
//   [2009-10-01] If a creature in combat has banding, its controller assigns damage for creatures
//     blocking or blocked by it.

export default defineCard({
  name: "Mishra's War Machine",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 5,
  toughness: 5,
  keywords: ["banding"],
  text: "Banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\nAt the beginning of your upkeep, this creature deals 3 damage to you unless you discard a card. If it deals damage to you this way, tap it.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // Minion of Leshrac's shape: tapped only if the damage was dealt.
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ discard: 1, text: "Discard a card" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 3, who: "you" },
            { kind: "conditional", condition: { kind: "damage-dealt-this-way", player: true }, then: { kind: "tap", target: "source" } },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, this creature deals 3 damage to you unless you discard a card. If it deals damage to you this way, tap it.",
    },
  ],
});
