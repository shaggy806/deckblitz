import { defineCard } from "../define.js";

// An untargeted shield on its controller (rule 615.7): a `damage-rule` to
// "you" with an amount, the next that much damage in all.
const TEXT = "{3}, {T}: Prevent the next 2 damage that would be dealt to you this turn.";

export default defineCard({
  name: "Conservator",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
