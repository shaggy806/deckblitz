import { defineCard } from "../define.js";

// Three different creatures, one per colour clause (its rulings) — the Herald
// itself may be one of them.
const TEXT =
  "{2}{G}, {T}, Sacrifice a red creature, a green creature, and a white creature: Search your library for a card named Godsire, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Behemoth's Herald",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}{G}",
        tap: true,
        sacrifice: {
          each: [
            { type: "creature", colors: ["R"] },
            { type: "creature", colors: ["G"] },
            { type: "creature", colors: ["W"] },
          ],
        },
      },
      targets: [],
      effect: { kind: "search-library", filter: { name: "Godsire" }, destination: "battlefield", min: 0, max: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
