import { defineCard } from "../define.js";

const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const MANA = "{1}, Remove X ki counters from this creature: Add X mana of any one color.";

export default defineCard({
  name: "Petalmane Baku",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  text: `${CAST}\n${MANA}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "ki", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: "x" },
      resolve: null,
      text: MANA,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Petalmane Baku?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
