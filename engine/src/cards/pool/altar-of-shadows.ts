import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 21830.
// The counter goes on even if the creature regenerates (the ruling).

const MANA_TEXT = "At the beginning of your first main phase, add {B} for each charge counter on this artifact.";
const DESTROY_TEXT = "{7}, {T}: Destroy target creature. Then put a charge counter on this artifact.";

export default defineCard({
  name: "Altar of Shadows",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${DESTROY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
        ],
      },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
