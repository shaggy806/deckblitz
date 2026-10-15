import { defineCard } from "../define.js";

// EDHREC rank 22965.

const TEXT = "{T}, Discard a card: Exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Chase Stein, Runaway",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
