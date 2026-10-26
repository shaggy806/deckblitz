import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 21986. Bushido 1 as Jukai Trainee writes it: one pump
// over two events (a creature never both blocks and becomes blocked in one combat).

const PROTECTION_TEXT = "Protection from white";
const BUSHIDO_TEXT = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 1,
  toughness: 1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Hand of Cruelty",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 2,
  text: `${PROTECTION_TEXT}\n${BUSHIDO_TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["W"] }, text: PROTECTION_TEXT }],
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
  ],
});
