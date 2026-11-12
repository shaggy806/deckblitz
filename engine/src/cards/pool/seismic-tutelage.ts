import { defineCard } from "../define.js";

// EDHREC rank 10989. Hydra's Growth's enter counter, Fractal Harness's doubling.

const ENTER_TEXT = "When this Aura enters, put a +1/+1 counter on enchanted creature.";
const ATTACK_TEXT = "Whenever enchanted creature attacks, double the number of +1/+1 counters on it.";

export default defineCard({
  name: "Seismic Tutelage",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "double-counters", target: "attached", counter: "+1/+1" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
