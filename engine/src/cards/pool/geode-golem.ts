import { defineCard } from "../define.js";

// EDHREC rank 3244.
// Rulings:
//   [2020-11-10] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2020-11-10] If you cast a card "without paying its mana cost," you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs. If the card has any
//     mandatory additional costs, such as the commander tax, those must be paid.
//   [2020-11-10] If you wish to cast your commander without paying its mana cost, you must cast
//     it while the triggered ability of Geode Golem is resolving. It may be cast at a time you
//     normally wouldn't be able to cast a creature spell.
//   [2020-11-10] Geode Golem's triggered ability triggers even if your commander isn't in the
//     command zone at the time Geode Golem deals combat damage to a player. If your commander
//     finds its way there before the trigger resolves, you can cast it.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may cast your commander from the command zone without paying its mana cost.";

export default defineCard({
  name: "Geode Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT} (You still pay any additional costs.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "command-zone", free: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
