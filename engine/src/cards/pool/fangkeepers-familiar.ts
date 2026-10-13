import { defineCard } from "../define.js";

// EDHREC rank 10997.
//
// The mode is chosen as the trigger goes on the stack, with its target
// (rule 700.2b — `announced`, The Mightstone and Weakstone's shape).

const ETB_TEXT = "When this creature enters, choose one —";
const LIFE_MODE =
  "• You gain 3 life and surveil 3. (Look at the top three cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";
const ENCHANTMENT_MODE = "• Destroy target enchantment.";
const COUNTER_MODE = "• Counter target creature spell.";

export default defineCard({
  name: "Fangkeeper's Familiar",
  manaCost: "{1}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n${LIFE_MODE}\n${ENCHANTMENT_MODE}\n${COUNTER_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "• You gain 3 life and surveil 3.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 3 },
                { kind: "surveil", amount: 3 },
              ],
            },
          },
          { text: ENCHANTMENT_MODE, targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
          { text: COUNTER_MODE, targets: ["creature-spell"], effect: { kind: "counter", target: 0 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${LIFE_MODE} ${ENCHANTMENT_MODE} ${COUNTER_MODE}`,
    },
  ],
});
