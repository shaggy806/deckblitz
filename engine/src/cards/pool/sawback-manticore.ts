import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 32244.

export default defineCard({
  name: "Sawback Manticore",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Manticore"],
  power: 2,
  toughness: 4,
  text: "{4}: This creature gains flying until end of turn.\n{1}: This creature deals 2 damage to target attacking or blocking creature. Activate only if this creature is attacking or blocking and only once each turn.",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{4}: This creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      condition: { kind: "source", filter: { anyOf: [{ attacking: true }, { blocking: true }] } },
      oncePerTurn: true,
      text: "{1}: This creature deals 2 damage to target attacking or blocking creature. Activate only if this creature is attacking or blocking and only once each turn.",
    },
  ],
});
