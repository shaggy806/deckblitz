import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 16154.
//
// The {1} is a `may`'s cost, paid once as the trigger resolves. The artifact
// count is an activation condition, checked only as the ability is activated
// (the ruling).
const DRAIN =
  "Whenever an artifact you control enters, you may pay {1}. If you do, each opponent loses 1 life and you gain 1 life.";
const KILL =
  "{1}{B}, Sacrifice this enchantment: Destroy target creature. Activate only if you control two or more artifacts.";

export default defineCard({
  name: "Underhanded Designs",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DRAIN}\n${KILL}`,
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
      text: DRAIN,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 2 },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: KILL,
    },
  ],
});
