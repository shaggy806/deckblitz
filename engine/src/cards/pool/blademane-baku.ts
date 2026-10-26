import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 28024. Petalmane Baku's shape: X is the
// number of ki counters removed, so the pump is +2X/+0.

const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const PUMP =
  "{1}, Remove X ki counters from this creature: For each counter removed, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Blademane Baku",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: `${CAST}\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "ki", count: "x" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: { product: ["x", 2] }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Blademane Baku?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
