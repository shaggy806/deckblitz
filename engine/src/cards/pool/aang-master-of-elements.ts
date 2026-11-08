import { defineCard } from "../define.js";

// The back face of Avatar Aang. "If you do" is the transform effect's `then`
// (B278): nothing more happens unless he transformed.
const COST_TEXT = "Spells you cast cost {W}{U}{B}{R}{G} less to cast. (This can reduce generic costs.)";
const UPKEEP_TEXT =
  "At the beginning of each upkeep, you may transform Aang, Master of Elements. If you do, you gain 4 life, draw four cards, put four +1/+1 counters on him, and he deals 4 damage to each opponent.";

export default defineCard({
  name: "Aang, Master of Elements",
  art: "https://cards.scryfall.io/art_crop/back/f/e/fe29e909-50e9-4f04-b1a3-2cc5d7e3efe8.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Ally"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${COST_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", reduceColored: "{W}{U}{B}{R}{G}" },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Transform Aang, Master of Elements?",
        effect: {
          kind: "transform",
          target: "source",
          then: {
            kind: "sequence",
            effects: [
              { kind: "gain-life", amount: 4 },
              { kind: "draw", amount: 4 },
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: 4 },
              { kind: "damage", who: "each-opponent", amount: 4 },
            ],
          },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Avatar Aang", "Aang, Master of Elements"],
  transform: true,
});
