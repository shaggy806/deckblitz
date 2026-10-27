import { defineCard } from "../define.js";

// Torment. EDHREC rank 30000.

const TEXT =
  "{2}{B}{B}, {T}, Exile two cards from your graveyard: Return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Cabal Surgeon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: true, exileFromGraveyard: { count: 2 } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
