import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature dealt damage by this creature this turn dies, put that card onto the battlefield under your control at the beginning of the next end step. Sacrifice the creature when you lose control of this creature.";

// With this creature gone by then, nothing is watched and you never sacrifice
// the card. With it under someone else, you keep the card until you've regained
// this creature and lost it again (the ruling).
export default defineCard({
  name: "Seraph",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        text: "Put that card onto the battlefield under your control. Sacrifice the creature when you lose control of this creature.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
            {
              kind: "delayed-trigger",
              at: { losesControl: "source" },
              about: "put-onto-battlefield",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice the creature when you lose control of this creature.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
