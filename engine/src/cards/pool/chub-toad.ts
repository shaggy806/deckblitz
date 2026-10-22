import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 22259.
//
// One ability over two events, written as Jukai Trainee's is: a creature never
// both blocks and becomes blocked in one combat.
const TEXT = "Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 2,
  toughness: 2,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Chub Toad",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
