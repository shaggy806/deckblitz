import { defineCard } from "../define.js";

// An untargeted shield on its controller (rule 615.7): a `damage-rule` to
// "you" with an amount; each activation adds another.
const TEXT = "{2}: Prevent the next 1 damage that would be dealt to you this turn.";

export default defineCard({
  name: "Shield of the Ages",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
