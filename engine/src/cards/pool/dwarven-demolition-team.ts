import { defineCard } from "../define.js";

// EDHREC rank 29542.

export default defineCard({
  name: "Dwarven Demolition Team",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: "{T}: Destroy target Wall.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target Wall.",
    },
  ],
});
