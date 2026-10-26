import { defineCard } from "../define.js";

// Saviors of Kamigawa. Bushido 2 (rule 702.45a) as two triggers, Jade
// Avenger's way: a creature never both blocks and becomes blocked in one combat.
const TEXT = "Bushido 2";
const PUMP = { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Inner-Chamber Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 0,
  toughness: 2,
  text: "Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
