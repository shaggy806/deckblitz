import { defineCard } from "../define.js";

// EDHREC rank 10314.
//
// Rulings:
//   [2013-09-15] You must pay all costs to cast the exiled card. You may pay alternative or
//     additional costs. If the card has any mandatory additional costs, you must pay those.
//   [2013-09-15] If the exiled card is a land card, you won't gain any life and you won't be able
//     to play the land.
//   [2013-09-15] If Daxos is blocked by a creature, raising that creature's power to 3 or greater
//     won't change or undo the block.
//   [2013-09-15] Daxos doesn't change when you can cast the exiled card. For example, if you exile
//     a creature card without flash, you can cast it only during your main phase when the stack is
//     empty.

const DAMAGE_TEXT =
  "Whenever Daxos deals combat damage to a player, exile the top card of that player's library. You gain life equal to that card's mana value. Until end of turn, you may cast that card and you may spend mana as though it were mana of any color to cast that spell.";

// Grenzo, Havoc Raiser's exile (cast only — a land stays put), then the life
// read off the card exiled this way, as Daredevil, Fearless Fighter reads it
// (a land's mana value is 0).
export default defineCard({
  name: "Daxos of Meletis",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `Daxos can't be blocked by creatures with power 3 or greater.\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 3 } },
      text: "Daxos can't be blocked by creatures with power 3 or greater.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "impulse-exile",
            amount: 1,
            whose: "trigger-player",
            duration: "end-of-turn",
            castOnly: true,
            spendAs: "any-color",
          },
          { kind: "gain-life", amount: { thisWay: "exiled", sumOf: "mana-value" } },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
