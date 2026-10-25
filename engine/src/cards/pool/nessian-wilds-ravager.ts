import { defineCard } from "../define.js";

// EDHREC rank 12999.

export default defineCard({
  name: "Nessian Wilds Ravager",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 6,
  toughness: 6,
  tribute: 6,
  text: "Tribute 6 (As this creature enters, an opponent of your choice may put six +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, you may have this creature fight another target creature. (Each deals damage equal to its power to the other.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "may", prompt: "Have Nessian Wilds Ravager fight the target creature?", effect: { kind: "fight", a: "source", b: 0 } },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, you may have this creature fight another target creature.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
