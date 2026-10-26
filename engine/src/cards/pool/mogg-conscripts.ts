import { defineCard } from "../define.js";

// EDHREC rank 27779.
//
// Rulings:
//   [2008-04-01] A "creature spell" is any spell with the type Creature, even if it has other
//     types such as Artifact or Enchantment. Older cards of type Summon are also Creature spells.
// `cast-this-turn` counts spells as they were cast, whatever became of them.

const TEXT = "This creature can't attack unless you've cast a creature spell this turn.";

export default defineCard({
  name: "Mogg Conscripts",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "cast-this-turn", filter: { type: "creature" } } },
      text: TEXT,
    },
  ],
});
