import { defineCard } from "../define.js";

// X is the life gained this turn, whatever was lost (its ruling), read as the
// trigger resolves; the life paid is exactly X — never less (its ruling).
const END_TEXT =
  "At the beginning of your end step, if you gained life this turn, you may pay X life, where X is the amount of life you gained this turn. If you do, create an X/X black Demon creature token with flying.";
const X = { turnStat: "life-gained", who: "you" } as const;

export default defineCard({
  name: "Tivash, Gloom Summoner",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay X life (X = life you gained this turn) to create an X/X Demon?",
        costLife: X,
        effect: {
          kind: "create-token",
          token: "X/X Demon Token (Flying)",
          count: 1,
          basePt: { power: X, toughness: X },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
