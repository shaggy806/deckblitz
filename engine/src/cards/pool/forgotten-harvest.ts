import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 31432. The creature is targeted as the trigger goes
// on the stack; the land card is chosen as it resolves (Master Skald's shape).

const TEXT =
  "At the beginning of your upkeep, you may exile a land card from your graveyard. If you do, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Forgotten Harvest",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Exile a land card from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "land" },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
