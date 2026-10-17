import { defineCard } from "../define.js";

// EDHREC rank 8798.
//
// Rulings:
//   [2023-10-13] If the target is both a creature and a land as the triggered ability resolves, it
//     will become a copy of The Flood of Mars. Excepting some very unusual cases, that copy won't
//     be a land, so it won't also become an Island.
//
// Both "if it's …" are read as the ability resolves, in printed order: the
// land check comes after the copy, so a creature land that became a copy is
// asked as the copy (the ruling). Neither change has a duration — the copy
// (rule 611.2a, as Mirrorform's) and the Island type last for as long as it's
// that permanent, flood counter or not (unlike Eluge's "for as long as it has
// a flood counter on it"). The copy is of The Flood of Mars as it is, or as it
// last existed if it has left (rule 608.2h).
const FLOOD_TEXT =
  "Water Always Wins — Whenever this creature attacks, put a flood counter on another target creature or land. If it's a creature, it becomes a copy of this creature. If it's a land, it becomes an Island in addition to its other types.";

export default defineCard({
  name: "The Flood of Mars",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Alien", "Zombie", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${FLOOD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "flood", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "become-copy", target: 0, of: "source" },
          },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "land" } },
            then: { kind: "add-types", target: 0, addSubtypes: ["Island"], duration: "permanent" },
          },
        ],
      },
      resolve: null,
      text: FLOOD_TEXT,
    },
  ],
});
