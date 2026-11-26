import { defineCard } from "../define.js";

// "Attacking alone" (rule 506.5, `attackingAlone`): attacking while no other
// creature is.

const TEXT = "{T}: Target creature you control that's attacking alone gets +1/+0 until end of turn. You gain 1 life.";

export default defineCard({
  name: "Crowd of True Believers",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", attackingAlone: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
