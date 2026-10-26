import { defineCard } from "../define.js";

// EDHREC rank 28124. Shards of Alara. Three different creatures, one per
// color (a multicolored one fills one slot; the Herald itself may be one) —
// Viscerid Drone's `each` sacrifice.
const TEXT =
  "{2}{R}, {T}, Sacrifice a black creature, a red creature, and a green creature: Search your library for a card named Hellkite Overlord, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Dragon's Herald",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}{R}",
        tap: true,
        sacrifice: {
          each: [
            { type: "creature", colors: ["B"] },
            { type: "creature", colors: ["R"] },
            { type: "creature", colors: ["G"] },
          ],
        },
      },
      targets: [],
      effect: { kind: "search-library", filter: { name: "Hellkite Overlord" }, destination: "battlefield", min: 0, max: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
