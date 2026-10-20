import { defineCard } from "../define.js";

// "Choose one that hasn't been chosen" is `notChosenBefore`: for as long as
// this object has been on the battlefield (rule 400.7). Once all three are
// chosen, the trigger has nothing left to choose and does nothing.
const TRIGGER_TEXT = "At the beginning of combat on your turn, choose one that hasn't been chosen —";
const SAC_MODE = "Each player sacrifices a creature of their choice.";
const DRAW_MODE = "You draw a card and you lose 1 life.";
const TRANSFORM_MODE = "Transform Henrika.";

export default defineCard({
  name: "Henrika Domnathi",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n• ${SAC_MODE}\n• ${DRAW_MODE}\n• ${TRANSFORM_MODE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: SAC_MODE,
            effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
          },
          {
            text: DRAW_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "lose-life", amount: 1 },
              ],
            },
          },
          { text: TRANSFORM_MODE, effect: { kind: "transform", target: "source" } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${SAC_MODE} ${DRAW_MODE} ${TRANSFORM_MODE}`,
    },
  ],
  faces: ["Henrika Domnathi", "Henrika, Infernal Seer"],
  transform: true,
});
