import { defineCard } from "../define.js";
import { forageCost } from "../helpers.js";

export default defineCard({
  name: "Thornvault Forager",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Ranger"],
  power: 2,
  toughness: 2,
  text: "{T}: Add {G}.\n{T}, Forage: Add two mana in any combination of colors. (To forage, exile three cards from your graveyard or sacrifice a Food.)\n{3}{G}, {T}: Search your library for a Squirrel card, reveal it, put it into your hand, then shuffle.",
  activated: [
    { cost: { mana: null, tap: true }, targets: [], effect: { kind: "add-mana", mana: "G", amount: 1 }, resolve: null, text: "{T}: Add {G}." },
    {
      cost: { mana: null, tap: true, do: forageCost() },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 2 },
      resolve: null,
      text: "{T}, Forage: Add two mana in any combination of colors. (To forage, exile three cards from your graveyard or sacrifice a Food.)",
    },
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Squirrel" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: "{3}{G}, {T}: Search your library for a Squirrel card, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
