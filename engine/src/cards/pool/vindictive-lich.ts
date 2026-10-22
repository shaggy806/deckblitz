import { defineCard } from "../define.js";

// EDHREC rank 7633.
//
// Rulings: no more modes than you have opponents, each mode a different
// target opponent; you needn't choose a mode for every opponent. The modes and
// their targets are chosen as the ability goes on the stack (`announced`).

const TRIGGER_TEXT = "When this creature dies, choose one or more. Each mode must target a different player.";
const SAC_MODE = "Target opponent sacrifices a creature of their choice.";
const DISCARD_MODE = "Target opponent discards two cards.";
const LIFE_MODE = "Target opponent loses 5 life.";

export default defineCard({
  name: "Vindictive Lich",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 4,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n• ${SAC_MODE}\n• ${DISCARD_MODE}\n• ${LIFE_MODE}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        eachTargetsDifferentPlayer: true,
        minModes: 1,
        maxModes: 3,
        modes: [
          {
            text: SAC_MODE,
            targets: ["opponent"],
            effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
          },
          {
            text: DISCARD_MODE,
            targets: ["opponent"],
            effect: { kind: "discard", target: 0, amount: 2 },
          },
          {
            text: LIFE_MODE,
            targets: ["opponent"],
            effect: { kind: "lose-life", amount: 5, target: 0 },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${SAC_MODE} ${DISCARD_MODE} ${LIFE_MODE}`,
    },
  ],
});
