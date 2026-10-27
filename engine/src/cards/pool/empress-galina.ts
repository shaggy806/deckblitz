import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 9699.

export default defineCard({
  name: "Empress Galina",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Noble"],
  power: 1,
  toughness: 3,
  text: "{U}{U}, {T}: Gain control of target legendary permanent. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { supertype: "legendary" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: "{U}{U}, {T}: Gain control of target legendary permanent. (This effect lasts indefinitely.)",
    },
  ],
});
