import { defineCard } from "../define.js";

// EDHREC rank 10412.
//
// "Each creature that convoked it" is its spell's convokers, carried onto the
// permanent; one that has left (or come back as a new object) gets nothing.
//
// Rulings:
//   [2023-04-14] You can't tap more creatures to convoke Zephyr Singer than is necessary to pay
//     for the spell. In most cases, this means four creatures. However, if there are any
//     additional costs to cast Zephyr Singer, you may use convoke to pay those additional costs as
//     well.
//   [2024-01-12] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Convoke
//     applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or
//     mana value.
//   [2024-01-12] Tapping an untapped creature that's attacking or blocking to convoke a spell
//     won't cause that creature to stop attacking or blocking.
//   [2024-01-12] You can tap any untapped creature you control to convoke a spell, even one you
//     haven't controlled continuously since the beginning of your most recent turn.
//   [2024-01-12] Tapping a multicolored creature using convoke will pay for {1} or one mana of
//     your choice of any of that creature's colors.
//   [2024-01-12] If a creature you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with convoke will result in the creature being tapped
//     before you pay the spell's costs. You won't be able to tap it again for convoke. Similarly,
//     if you sacrifice a creature to activate a mana ability while casting a spell with convoke,
//     that creature won't be on the battlefield when you pay the spell's costs, so you won't be
//     able to tap it for convoke.
//   [2024-01-12] Because convoke isn't an alternative cost, it can be used in conjunction with
//     alternative costs.

export default defineCard({
  name: "Zephyr Singer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying, vigilance\nWhen this creature enters, put a flying counter on each creature that convoked it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "for-each-convoker", effect: { kind: "add-counter", target: 0, counter: "flying", amount: 1 } },
      resolve: null,
      text: "When this creature enters, put a flying counter on each creature that convoked it.",
    },
  ],
});
