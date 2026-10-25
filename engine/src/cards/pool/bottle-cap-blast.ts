import { defineCard } from "../define.js";

// EDHREC rank 4043.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2024-03-08] For a planeswalker, excess damage means damage in excess of the planeswalker's
//     loyalty (the number of loyalty counters it has on it). For a battle, excess damage means
//     damage in excess of the battle's defense (the number of defense counters it has on it).
//   [2024-03-08] Excess damage has been dealt to a creature if the damage dealt to it is greater
//     than lethal damage. Usually, this means damage greater than its toughness, although damage
//     already marked on the creature is taken into account.
//   [2024-03-08] Improvise doesn't change Bottle-Cap Blast's mana cost or mana value, and it can't
//     reduce Bottle-Cap Blast's cost below {R}.

export default defineCard({
  name: "Bottle-Cap Blast",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nBottle-Cap Blast deals 5 damage to any target. If excess damage was dealt to a permanent this way, create that many tapped Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  targets: ["any-target"],
  // Hell to Pay's shape: the excess dealt to a permanent this way (none to a
  // player) is how many tapped Treasures.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "create-token", token: "Treasure Token", count: { excessDamageThisWay: true }, tapped: true },
    ],
  },
});
