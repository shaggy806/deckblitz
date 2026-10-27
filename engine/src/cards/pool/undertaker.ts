import { defineCard } from "../define.js";

// EDHREC rank 11307. A Spellshaper.

const TEXT = "{B}, {T}, Discard a card: Return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Undertaker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      resolve: null,
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      text: TEXT,
    },
  ],
});
