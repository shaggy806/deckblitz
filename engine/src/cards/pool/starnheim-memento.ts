import { defineCard } from "../define.js";

export default defineCard({
  name: "Starnheim Memento",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {W}.\n{1}{W}, {T}: Target creature gets +1/+1 and gains flying until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}{W}, {T}: Target creature gets +1/+1 and gains flying until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
