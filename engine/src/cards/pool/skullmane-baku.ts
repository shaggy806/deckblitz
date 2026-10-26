import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 28128. Petalmane Baku's shape, with
// Death Wind's -X/-X.

const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const SHRINK = "{1}, {T}, Remove X ki counters from this creature: Target creature gets -X/-X until end of turn.";

export default defineCard({
  name: "Skullmane Baku",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${CAST}\n${SHRINK}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "ki", count: "x" } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: SHRINK,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Skullmane Baku?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
