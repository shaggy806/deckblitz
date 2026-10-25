import { defineCard } from "../define.js";

// EDHREC rank 18039. Drumbellower's static, narrowed to creatures with a
// +1/+1 counter.

const TEXT = "Untap each creature you control with a +1/+1 counter on it during each other player's untap step.";

export default defineCard({
  name: "Ivorytusk Fortress",
  manaCost: "{2}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 5,
  toughness: 7,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      untapsDuringOthersUntap: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      text: TEXT,
    },
  ],
});
