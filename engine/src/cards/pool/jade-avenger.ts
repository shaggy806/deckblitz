import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). Bushido 2 (rule 702.45a) — "whenever this creature
// blocks or becomes blocked, it gets +2/+2 until end of turn" — as two
// triggers, Jukai Trainee's and Fumiko's way: a creature never both blocks
// and becomes blocked in one combat.
const TEXT = "Bushido 2";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 2,
  toughness: 2,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Jade Avenger",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Samurai"],
  power: 2,
  toughness: 2,
  text: "Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
