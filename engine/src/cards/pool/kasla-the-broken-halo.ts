import { defineCard } from "../define.js";

// EDHREC rank 14127.
//
// Rulings:
//   [2023-04-14] Kasla's last ability will trigger whether you tapped any creatures to pay for the
//     spell or not, as long as it has convoke.
//   [2024-01-12] If a creature you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with convoke will result in the creature being tapped
//     before you pay the spell's costs. You won't be able to tap it again for convoke. Similarly,
//     if you sacrifice a creature to activate a mana ability while casting a spell with convoke,
//     that creature won't be on the battlefield when you pay the spell's costs, so you won't be
//     able to tap it for convoke.
//   [2024-01-12] Because convoke isn't an alternative cost, it can be used in conjunction with
//     alternative costs.
//   [2024-01-12] Tapping an untapped creature that's attacking or blocking to convoke a spell
//     won't cause that creature to stop attacking or blocking.
//   [2024-01-12] Tapping a multicolored creature using convoke will pay for {1} or one mana of
//     your choice of any of that creature's colors.
//   [2024-01-12] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Convoke
//     applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or
//     mana value.
//   [2024-01-12] You can tap any untapped creature you control to convoke a spell, even one you
//     haven't controlled continuously since the beginning of your most recent turn.

export default defineCard({
  name: "Kasla, the Broken Halo",
  manaCost: "{3}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Ally"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "vigilance", "haste"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying, vigilance, haste\nWhenever you cast another spell that has convoke, scry 2, then draw a card.",
  triggered: [
    {
      // Whether or not anything convoked it (the ruling). "Another": Kasla
      // is a spell only while her ability doesn't exist yet.
      trigger: { on: "cast-spell", who: "you", filter: { hasConvoke: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you cast another spell that has convoke, scry 2, then draw a card.",
    },
  ],
});
