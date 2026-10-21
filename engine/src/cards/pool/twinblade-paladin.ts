import { defineCard } from "../define.js";

// EDHREC rank 12030.
//
// Ajani's Pridemate's counter, and Angel of Vitality's 25-life threshold
// gating double strike — read live, so first-strike damage that drops the
// life total below 25 takes it away before regular damage (the rulings).

const GAIN_TEXT = "Whenever you gain life, put a +1/+1 counter on this creature.";
const DOUBLE_TEXT =
  "As long as you have 25 or more life, this creature has double strike. (It deals both first-strike and regular combat damage.)";

export default defineCard({
  name: "Twinblade Paladin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${GAIN_TEXT}\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", who: "you", atLeast: 25 },
      grantKeywords: ["double-strike"],
      text: DOUBLE_TEXT,
    },
  ],
});
