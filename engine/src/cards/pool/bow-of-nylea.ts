import { defineCard } from "../define.js";

// EDHREC rank 2404.
//
// Rulings:
//   [2013-09-15] You choose which mode you're using as you activate the ability.

export default defineCard({
  name: "Bow of Nylea",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment", "artifact"],
  text: "Attacking creatures you control have deathtouch.\n{1}{G}, {T}: Choose one —\n• Put a +1/+1 counter on target creature.\n• Bow of Nylea deals 2 damage to target creature with flying.\n• You gain 3 life.\n• Put up to four target cards from your graveyard on the bottom of your library in any order.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on target creature.",
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: "Bow of Nylea deals 2 damage to target creature with flying.",
            targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
            effect: { kind: "damage", amount: 2, target: 0 },
          },
          {
            text: "You gain 3 life.",
            effect: { kind: "gain-life", amount: 3 },
          },
          {
            // "In any order": they go to the bottom in the order chosen.
            text: "Put up to four target cards from your graveyard on the bottom of your library in any order.",
            targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 4 }],
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 0, position: "bottom" },
            },
          },
        ],
      },
      resolve: null,
      text: "{1}{G}, {T}: Choose one —",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", attacking: true } },
      grantKeywords: ["deathtouch"],
      text: "Attacking creatures you control have deathtouch.",
    },
  ],
});
