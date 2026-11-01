import { defineCard } from "../define.js";

// EDHREC rank 20417. "Sacrifice enchanted creature" is `hostOfSource` on the
// cost's filter, matched against this Aura: payable only while you control
// the creature it enchants (rule 701.21a, and the ruling). The
// untapped creature the first ability takes may be the enchanted one, which
// then gets nothing.

const PUMP = "Sacrifice an untapped creature: Enchanted creature gets +2/+0 until end of turn.";
const TEAM = "Sacrifice enchanted creature: Creatures you control get +2/+0 until end of turn.";

export default defineCard({
  name: "Betrothed of Fire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${TEAM}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature", tapped: false } } },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { hostOfSource: true } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEAM,
    },
  ],
});
