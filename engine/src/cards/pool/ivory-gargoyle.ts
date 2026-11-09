import { defineCard } from "../define.js";

// Molten Firebird's shape. Whoever controlled it as it died skips their draw step,
// whether or not it returns (the ruling).
const DIES_TEXT =
  "When this creature dies, return it to the battlefield under its owner's control at the beginning of the next end step and you skip your next draw step.";
const EXILE_TEXT = "{4}{W}: Exile this creature.";

export default defineCard({
  name: "Ivory Gargoyle",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            effect: { kind: "put-onto-battlefield", target: "trigger-object" },
            text: "Return Ivory Gargoyle to the battlefield under its owner's control.",
          },
          { kind: "skip-step", step: "draw", who: "you" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: { kind: "exile", target: "source" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
