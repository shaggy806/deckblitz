import { defineCard } from "../define.js";

// EDHREC rank 23142. Scrollboost's "one or two target creatures": a first
// slot that must be chosen and a second, different one that may not be.

const PUMP_TEXT = "One or two target creatures each get +2/+1 until end of turn.";

export default defineCard({
  name: "Appeal to Eirdu",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${PUMP_TEXT}`,
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 1, duration: "end-of-turn" },
    ],
  },
});
