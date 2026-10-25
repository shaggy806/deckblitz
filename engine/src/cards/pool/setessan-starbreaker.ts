import { defineCard } from "../define.js";

// EDHREC rank 31461.

const TEXT = "When this creature enters, you may destroy target Aura.";

export default defineCard({
  name: "Setessan Starbreaker",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Aura" } }],
      effect: { kind: "may", prompt: "Destroy the target Aura?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
