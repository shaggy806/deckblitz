import { defineCard } from "../define.js";

// Saviors of Kamigawa. Bushido 1 (rule 702.45a) as two triggers, Jade
// Avenger's way: a creature never both blocks and becomes blocked in one combat.
const TEXT = "Bushido 1";
const PUMP = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Araba Mothrider",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nBushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)",
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
