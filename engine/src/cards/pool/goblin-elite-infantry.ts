import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30398.
//
// Chub Toad's shape: one ability over two events — a creature never both
// blocks and becomes blocked in one combat.

const TEXT = "Whenever this creature blocks or becomes blocked, it gets -1/-1 until end of turn.";
const SHRINK = {
  kind: "modify-pt",
  target: "source",
  power: -1,
  toughness: -1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Goblin Elite Infantry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SHRINK, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: SHRINK, resolve: null, text: TEXT },
  ],
});
