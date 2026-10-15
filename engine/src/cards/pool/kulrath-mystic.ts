import { defineCard } from "../define.js";

// EDHREC rank 25269.
//
// Rulings:
//   [2025-11-17] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.
//
// Tanufel Rimespeaker's trigger: a spell's `manaValue` on the stack counts its
// chosen {X} (rule 202.3e).
const TEXT =
  "Whenever you cast a spell with mana value 4 or greater, this creature gets +2/+0 and gains vigilance until end of turn.";

export default defineCard({
  name: "Kulrath Mystic",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Wizard"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
