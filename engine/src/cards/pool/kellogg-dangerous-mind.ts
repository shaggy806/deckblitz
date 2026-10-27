import { defineCard } from "../define.js";

// EDHREC rank 2562. The steal is Master Thief's `whileYouControlSource`,
// which does nothing if you don't control Kellogg as it would begin.
//
// Rulings:
//   [2024-03-08] If you lose control of Kellogg before its last ability resolves, you won't gain
//     control of the target creature at all.

const ATTACK_TEXT = "Whenever Kellogg attacks, create a Treasure token.";
const STEAL_TEXT =
  "Sacrifice five Treasures: Gain control of target creature for as long as you control Kellogg. Activate only as a sorcery.";

export default defineCard({
  name: "Kellogg, Dangerous Mind",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${ATTACK_TEXT}\n${STEAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" }, count: 5 } },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: STEAL_TEXT,
      sorcerySpeed: true,
    },
  ],
});
