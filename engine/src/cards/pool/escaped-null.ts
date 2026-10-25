import { defineCard } from "../define.js";

const TEXT = "Whenever this creature blocks or becomes blocked, it gets +5/+0 until end of turn.";
const PUMP = { kind: "modify-pt", target: "source", power: 5, toughness: 0, duration: "end-of-turn" } as const;

// Ruling: it triggers once, however many creatures it blocks or is blocked by.
export default defineCard({
  name: "Escaped Null",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Berserker"],
  power: 1,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
