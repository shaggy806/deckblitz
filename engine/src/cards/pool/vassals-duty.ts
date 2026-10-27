import { defineCard } from "../define.js";

// Champions of Kamigawa. A one-shot redirection shield (the en-Kor shape)
// whose damage goes to the ability's controller.

export default defineCard({
  name: "Vassal's Duty",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{1}: The next 1 damage that would be dealt to target legendary creature you control this turn is dealt to you instead.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", supertype: "legendary", controlledBy: "you" } }],
      effect: { kind: "prevent-damage", target: 0, amount: 1, redirectTo: "you" },
      resolve: null,
      text: "{1}: The next 1 damage that would be dealt to target legendary creature you control this turn is dealt to you instead.",
    },
  ],
});
