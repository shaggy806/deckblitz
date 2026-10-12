import { defineCard } from "../define.js";

export default defineCard({
  name: "Panacea",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{X}{X}, {T}: Prevent the next X damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{X}{X}", tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: "x" },
      resolve: null,
      text: "{X}{X}, {T}: Prevent the next X damage that would be dealt to any target this turn.",
    },
  ],
});
