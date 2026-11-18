import { defineCard } from "../define.js";

// X counts this resolution too, so the first each turn is +1/+0, the second
// +2/+0 (its ruling), whatever the Cudgels was attached to as each resolved;
// a countered one never resolved. The count is this object's, per turn.
const PUMP =
  "{2}: Until end of turn, equipped creature gets +X/+0, where X is the number of times this ability has resolved this turn.";

export default defineCard({
  name: "Bronze Cudgels",
  manaCost: "{1}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: { timesResolvedThisTurn: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
