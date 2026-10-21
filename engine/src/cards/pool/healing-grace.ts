import { defineCard } from "../define.js";

// EDHREC rank 22890.

export default defineCard({
  name: "Healing Grace",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 3 damage that would be dealt to any target this turn by a source of your choice. You gain 3 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage-from-chosen-source", to: 0, amount: 3 },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
