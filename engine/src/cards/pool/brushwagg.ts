import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30898.
//
// One ability over two events, as Chub Toad's is: a creature never both blocks
// and becomes blocked in one combat.

const TEXT = "Whenever this creature blocks or becomes blocked, it gets -2/+2 until end of turn.";
const SHIFT = {
  kind: "modify-pt",
  target: "source",
  power: -2,
  toughness: 2,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Brushwagg",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Brushwagg"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SHIFT, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: SHIFT, resolve: null, text: TEXT },
  ],
});
