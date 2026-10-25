import { defineCard } from "../define.js";

// Kaladesh. The artifact count is checked only as the ability is activated
// (the ruling) — an activation condition.
const TRIGGER_TEXT =
  "Whenever an artifact you control enters, you may pay {1}. If you do, each opponent loses 1 life and you gain 1 life.";
const SAC_TEXT =
  "{1}{B}, Sacrifice this enchantment: Destroy target creature. Activate only if you control two or more artifacts.";

export default defineCard({
  name: "Underhanded Designs",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have each opponent lose 1 life and gain 1 life?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1, who: "each-opponent" },
            { kind: "gain-life", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 2 },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
