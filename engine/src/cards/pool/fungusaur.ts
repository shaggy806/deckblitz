import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 23664.
//
// `dealt-damage` fires once per simultaneous damage event, however many
// sources dealt it — the ruling's "it only gets one counter".
const TEXT = "Whenever this creature is dealt damage, put a +1/+1 counter on it.";

export default defineCard({
  name: "Fungusaur",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Dinosaur"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
