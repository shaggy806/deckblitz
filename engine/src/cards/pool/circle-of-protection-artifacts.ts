import { defineCard } from "../define.js";

export default defineCard({
  name: "Circle of Protection: Artifacts",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{2}: The next time an artifact source of your choice would deal damage to you this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", filter: { type: "artifact" }, to: "you", amount: "next-time" },
      resolve: null,
      text: "{2}: The next time an artifact source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
