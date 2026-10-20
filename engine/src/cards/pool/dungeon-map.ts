import { defineCard } from "../define.js";

export default defineCard({
  name: "Dungeon Map",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {C}.\n{3}, {T}: Venture into the dungeon. Activate only as a sorcery. (Enter the first room or advance to the next room.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "{3}, {T}: Venture into the dungeon. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
