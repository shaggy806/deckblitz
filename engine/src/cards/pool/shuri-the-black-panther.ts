import { defineCard } from "../define.js";

// EDHREC rank 16282. Marvel Super Heroes Commander.
//
// Both counts are read as the ability resolves — no intervening-if — the
// second after the draw (Golbez, Crystal Collector's "Then if …" shape). The
// pump reaches the creatures you control then (rule 611.2c).
const ATTACK_TEXT =
  "Whenever Shuri attacks, draw a card if you control three or more artifacts. Then if you control six or more artifacts, creatures you control get +2/+2 until end of turn.";

export default defineCard({
  name: "Shuri, the Black Panther",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 3 },
            then: { kind: "draw", amount: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 6 },
            then: {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 2,
              toughness: 2,
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
