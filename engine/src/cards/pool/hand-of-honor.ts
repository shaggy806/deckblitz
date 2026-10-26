import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 18881. Bushido 1 as Jukai Trainee writes it: one pump
// over two events (a creature never both blocks and becomes blocked in one combat).

const PROTECTION_TEXT = "Protection from black";
const BUSHIDO_TEXT = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 1,
  toughness: 1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Hand of Honor",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 2,
  text: `${PROTECTION_TEXT}\n${BUSHIDO_TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["B"] }, text: PROTECTION_TEXT }],
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO_TEXT },
  ],
});
