import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK).
const TEXT = "Whenever you cast a Spirit or Arcane spell, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Briarknit Kami",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
