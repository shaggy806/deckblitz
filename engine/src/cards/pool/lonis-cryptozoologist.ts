import { defineCard } from "../define.js";

// EDHREC rank 5342.
//
// Rulings:
//   [2021-06-18] You can't sacrifice a Clue to activate its own ability and also to activate the
//     ability of Lonis, Cryptozoologist.
//   [2021-06-18] The token is named Clue Token and has the artifact subtype Clue. Clue isn't a
//     creature type.
//   [2021-06-18] The tokens are normal artifacts. For example, one can be sacrificed to activate
//     the ability of Breya's Apprentice and one can be the target of Break Ties.

export default defineCard({
  name: "Lonis, Cryptozoologist",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Elf", "Scout"],
  power: 1,
  toughness: 2,
  text: "Whenever another nontoken creature you control enters, investigate.\n{T}, Sacrifice X Clues: Target opponent reveals the top X cards of their library. You may put a nonland permanent card with mana value X or less from among them onto the battlefield under your control. That player puts the rest on the bottom of their library in a random order.",
  activated: [
    {
      // X is announced as it's activated (rules 107.3a, 602.2b) and that
      // many Clues are chosen as the cost is paid — a stack of Clue tokens
      // counting as every token in it.
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Clue" }, count: "x" } },
      targets: ["opponent"],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        from: { target: 0 },
        count: "x",
        reveal: true,
        min: 0,
        max: 1,
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
          notTypes: ["land"],
          manaValue: { op: "lte", n: { amount: "x" } },
        },
        destination: "battlefield",
        under: "you",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "{T}, Sacrifice X Clues: Target opponent reveals the top X cards of their library. You may put a nonland permanent card with mana value X or less from among them onto the battlefield under your control. That player puts the rest on the bottom of their library in a random order.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever another nontoken creature you control enters, investigate.",
    },
  ],
});
