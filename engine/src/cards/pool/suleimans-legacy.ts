import { defineCard } from "../define.js";

// Rulings:
//   Does nothing to Djinns or Efreets that phase in while it is on the battlefield.

const ETB = "When this enchantment enters, destroy all Djinns and Efreets. They can't be regenerated.";
const WATCH = "Whenever a Djinn or Efreet enters, destroy it. It can't be regenerated.";

export default defineCard({
  name: "Suleiman's Legacy",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: `${ETB}\n${WATCH}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { subtypes: ["Djinn", "Efreet"] }, cantBeRegenerated: true },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { subtypes: ["Djinn", "Efreet"] } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object", cantBeRegenerated: true },
      resolve: null,
      text: WATCH,
    },
  ],
});
