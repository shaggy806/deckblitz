import { defineCard } from "../define.js";

// EDHREC rank 9692.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//
// While modified it has both mana abilities: the granted {G}{G} is an
// additional ability, not a replacement for the printed {G}.
const MODIFIED_TEXT = 'As long as this creature is modified, it has "{T}: Add {G}{G}."';

export default defineCard({
  name: "Orochi Merge-Keeper",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Druid"],
  power: 1,
  toughness: 1,
  text: `{T}: Add {G}.\n${MODIFIED_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { modified: true } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: 2 },
          resolve: null,
          text: "{T}: Add {G}{G}.",
        },
      ],
      text: MODIFIED_TEXT,
    },
  ],
});
