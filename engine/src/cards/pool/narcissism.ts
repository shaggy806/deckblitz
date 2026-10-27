import { defineCard } from "../define.js";

export default defineCard({
  name: "Narcissism",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{G}, Discard a card: Target creature gets +2/+2 until end of turn.\n{G}, Sacrifice this enchantment: Target creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, Discard a card: Target creature gets +2/+2 until end of turn.",
    },
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, Sacrifice this enchantment: Target creature gets +2/+2 until end of turn.",
    },
  ],
});
