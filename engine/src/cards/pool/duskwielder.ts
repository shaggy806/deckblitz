import { defineCard } from "../define.js";

export default defineCard({
  name: "Duskwielder",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Berserker"],
  power: 1,
  toughness: 2,
  text: "Boast — {1}: Target opponent loses 1 life and you gain 1 life. (Activate only if this creature attacked this turn and only once each turn.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "Boast — {1}: Target opponent loses 1 life and you gain 1 life.",
      boast: true,
    },
  ],
});
