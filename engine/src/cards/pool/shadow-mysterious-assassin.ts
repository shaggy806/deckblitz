import { defineCard } from "../define.js";

// EDHREC rank 5678.
//
// Rulings:
//   [2025-06-06] If a permanent has {X} in its mana cost, X is 0 for the purpose of determining
//     its mana value.
//   [2025-06-06] Use the mana value of the sacrificed permanent as it last existed on the
//     battlefield to determine how much life each opponent loses.
//
// The sacrifice is the follow-up's "sacrificed", read as it last existed (Braids's shape).

const TEXT =
  "Throw — Whenever Shadow deals combat damage to a player, you may sacrifice another nonland permanent. If you do, draw two cards and each opponent loses life equal to the mana value of the sacrificed permanent.";

export default defineCard({
  name: "Shadow, Mysterious Assassin",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { notTypes: ["land"] }, exceptSource: true, text: "Sacrifice another nonland permanent" },
        ],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            { kind: "lose-life", who: "each-opponent", amount: { manaValueOf: "sacrificed" } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
