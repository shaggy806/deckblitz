import { defineCard } from "../define.js";

export default defineCard({
  name: "Sparksmith",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: "{T}: This creature deals X damage to target creature and X damage to you, where X is the number of Goblins on the battlefield.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { countOf: { subtype: "Goblin" } }, target: 0 },
          { kind: "damage", amount: { countOf: { subtype: "Goblin" } }, who: "you" },
        ],
      },
      resolve: null,
      text: "{T}: This creature deals X damage to target creature and X damage to you, where X is the number of Goblins on the battlefield.",
    },
  ],
});
