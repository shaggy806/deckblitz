import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 20379. Chub Toad's two triggers: a creature never
// both blocks and becomes blocked in one combat.

const TEXT = "Whenever this creature blocks or becomes blocked, it gets +2/-2 until end of turn.";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 2,
  toughness: -2,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Raging Gorilla",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
