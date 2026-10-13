import { defineCard } from "../define.js";

// EDHREC rank 6923.
//
// Rulings:
//   [2017-02-09] Kari Zev's Expertise can target any creature or Vehicle, even one that you
//     already control or that is already untapped.
//   [2017-02-09] If the Expertise spell you cast has any targets, and those targets become illegal
//     before the spell resolves, the spell doesn't resolve and none of its effects happen. You
//     won't get to cast a free spell.
//   [2017-02-09] Effects that allow you to "cast" a card don't allow you to play a land card.
//   [2017-02-09] While you're casting your free spell, the Expertise spell is still on the stack.
//     It will be put into its owner's graveyard after the free spell is cast. The free spell can't
//     target the Expertise card in your graveyard. It can target the Expertise spell on the stack,
//     but the Expertise spell will become an illegal target before the free spell resolves.
//   [2017-02-09] If the card has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2017-02-09] If you cast a card "without paying its mana cost," you can't choose to cast it
//     for any alternative costs, such as emerge costs. You can, however, pay additional costs. If
//     the card has any mandatory additional costs, such as that of Cathartic Reunion, you must pay
//     those to cast the card.
//   [2017-02-09] Any triggered abilities that trigger while performing the Expertise spell's first
//     effect won't be put onto the stack until after you're done casting your free spell. They're
//     put onto the stack at the same time as any abilities that triggered while casting that spell
//     regardless of the order in which those abilities triggered.
//   [2017-02-09] A card's mana value is determined solely by the mana symbols printed in its upper
//     right corner. The mana value is the total amount of mana in that cost, regardless of color.
//     For example, a card with mana cost {1}{U}{U} has mana value 3. Ignore any alternative costs,
//     additional costs, cost increases, or cost reductions that could apply to it. A card with no
//     mana cost has a mana value of 0.
//   [2017-04-18] The mana value of a split card is determined by the combined mana cost of its two
//     halves. If an expertise spell allows you to cast a split card, you may cast either half or,
//     if that split card has fuse, both halves.

export default defineCard({
  name: "Kari Zev's Expertise",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature or Vehicle until end of turn. Untap it. It gains haste until end of turn.\nYou may cast a spell with mana value 2 or less from your hand without paying its mana cost.",
  // Any creature or Vehicle, one you already control or an untapped one
  // included (the rulings).
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "cast-now", from: "hand", free: true, spell: { manaValue: { op: "lte", n: 2 } } },
    ],
  },
});
