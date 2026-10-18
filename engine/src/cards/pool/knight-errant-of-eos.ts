import { defineCard } from "../define.js";

// EDHREC rank 12814.
//
// X counts every creature that convoked it, still on the battlefield or not
// (the ruling): its spell's convokers, carried onto the permanent. The rest
// stay in the library, which is then shuffled.
//
// Rulings:
//   [2023-04-14] You can't tap more creatures to convoke Knight-Errant of Eos than is necessary to
//     pay for the spell. In most cases, this means five creatures. However, if there are any
//     additional costs to cast Knight-Errant of Eos, you may use convoke to pay those additional
//     costs as well.
//   [2023-04-14] It doesn't matter if the creatures that convoked Knight-Errant of Eos are still
//     on the battlefield or not as the enters-the-battlefield ability is resolving. You'll get
//     credit for them when determining the value of X.
//   [2024-01-12] Tapping an untapped creature that's attacking or blocking to convoke a spell
//     won't cause that creature to stop attacking or blocking.
//   [2024-01-12] If a creature you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with convoke will result in the creature being tapped
//     before you pay the spell's costs. You won't be able to tap it again for convoke. Similarly,
//     if you sacrifice a creature to activate a mana ability while casting a spell with convoke,
//     that creature won't be on the battlefield when you pay the spell's costs, so you won't be
//     able to tap it for convoke.
//   [2024-01-12] Tapping a multicolored creature using convoke will pay for {1} or one mana of
//     your choice of any of that creature's colors.
//   [2024-01-12] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Convoke
//     applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or
//     mana value.
//   [2024-01-12] Because convoke isn't an alternative cost, it can be used in conjunction with
//     alternative costs.
//   [2024-01-12] You can tap any untapped creature you control to convoke a spell, even one you
//     haven't controlled continuously since the beginning of your most recent turn.

export default defineCard({
  name: "Knight-Errant of Eos",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  convoke: true,
  text: "Convoke\nWhen this creature enters, look at the top six cards of your library. You may reveal up to two creature cards with mana value X or less from among them, where X is the number of creatures that convoked this creature. Put the revealed cards into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 6,
            reveal: "chosen",
            min: 0,
            max: 2,
            filter: { type: "creature", manaValue: { op: "lte", n: { amount: { convokers: true } } } },
            destination: "hand",
            leftover: "stay",
          },
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: "When this creature enters, look at the top six cards of your library. You may reveal up to two creature cards with mana value X or less from among them, where X is the number of creatures that convoked this creature. Put the revealed cards into your hand, then shuffle.",
    },
  ],
});
