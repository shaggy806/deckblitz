import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified; a counter of any kind, and Equipment whoever controls it, do (the `modified`
//     filter, rule 700.9).

const STATIC_TEXT = "Modified creatures you control can attack as though they didn't have defender.";

export default defineCard({
  name: "Guardians of Oboro",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Samurai"],
  power: 3,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${STATIC_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", modified: true } },
      canAttackAsThoughNoDefender: true,
      text: STATIC_TEXT,
    },
  ],
});
