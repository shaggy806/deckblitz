import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each end step, each opponent loses life equal to the life that player lost this turn. You gain life equal to the life lost this way. (Damage causes loss of life.)";

export default defineCard({
  name: "Gul Dukat, Colonial Prefect",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cardassian", "Rogue"],
  power: 6,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "lose-life",
              who: "that-player",
              amount: { turnStat: "life-lost", who: "that-player" },
            },
          },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
