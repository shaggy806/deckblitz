import { defineCard } from "../define.js";

// EDHREC rank 16158.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Steadfast Unicorn",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 1,
  toughness: 2,
  text: "{3}{W}: Creatures you control get +1/+1 and gain vigilance until end of turn. Activate only during your turn. (Attacking doesn't cause them to tap.)",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{3}{W}: Creatures you control get +1/+1 and gain vigilance until end of turn. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
});
