import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 23323.
//
// "This artifact or another artifact": any artifact entering, under anyone's
// control, itself included (no `otherOnly`).

const TEXT = "Whenever this artifact or another artifact enters, put a charge counter on this artifact.";

export default defineCard({
  name: "Serum Tank",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT}\n{3}, {T}, Remove a charge counter from this artifact: Draw a card.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{3}, {T}, Remove a charge counter from this artifact: Draw a card.",
    },
  ],
});
