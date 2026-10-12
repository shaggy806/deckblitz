import { defineCard } from "../define.js";

export default defineCard({
  name: "Academic Ascent",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains flying until end of turn.\nEmpower Jace 2. (Put two loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      { kind: "empower-jace", amount: 2 },
    ],
  },
});
