import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 27278.
//
// One ability over two events, written as Fumiko the Lowblood's bushido is: a creature never
// both blocks and becomes blocked in one combat.
const TEXT = "Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 1,
  toughness: 1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Jukai Trainee",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
