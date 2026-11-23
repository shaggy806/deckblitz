import { defineCard } from "../define.js";


export default defineCard({
  name: "Gobland",
  colors: ["R"],
  types: ["land", "creature"],
  subtypes: ["Mountain", "Goblin"],
  power: 2,
  toughness: 1,
  text: "(Gobland isn't a spell, it's affected by summoning sickness, and it has \"{T}: Add {R}.\")\nGobland can't block.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
  ],
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "Gobland can't block." }],
});
