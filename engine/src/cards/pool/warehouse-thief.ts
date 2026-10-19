import { defineCard } from "../define.js";

const TEXT =
  "{2}, {T}, Sacrifice an artifact or creature: Exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Warehouse Thief",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tiefling", "Rogue"],
  power: 4,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: true,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
