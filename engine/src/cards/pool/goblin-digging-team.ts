import { defineCard } from "../define.js";

const TEXT = "{T}, Sacrifice this creature: Destroy target Wall.";

export default defineCard({
  name: "Goblin Digging Team",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
