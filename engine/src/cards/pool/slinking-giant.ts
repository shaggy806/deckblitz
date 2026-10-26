import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 31205.
//
// Goblin Elite Infantry's shape: one ability over two events — a creature
// never both blocks and becomes blocked in one combat.

const TEXT = "Whenever this creature blocks or becomes blocked, it gets -3/-0 until end of turn.";
const SHRINK = {
  kind: "modify-pt",
  target: "source",
  power: -3,
  toughness: 0,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Slinking Giant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Rogue"],
  power: 4,
  toughness: 4,
  keywords: ["wither"],
  text: `Wither (This deals damage to creatures in the form of -1/-1 counters.)\n${TEXT}`,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SHRINK, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: SHRINK, resolve: null, text: TEXT },
  ],
});
