import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, it gets +1/+1 until end of turn for each other attacking Ally.";
// Counted as it resolves, any player's attacking Allies (a teammate's too — the rulings).
const OTHER_ATTACKING_ALLIES = { countOf: { type: "creature", subtype: "Ally", attacking: true }, excludeSelf: true } as const;

export default defineCard({
  name: "Angelic Captain",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Angel", "Ally"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: OTHER_ATTACKING_ALLIES,
        toughness: OTHER_ATTACKING_ALLIES,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
