import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 31186.

const TEXT = "{W}, Exile a creature card from your graveyard: You gain 1 life.";

export default defineCard({
  name: "Soul Shepherd",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
