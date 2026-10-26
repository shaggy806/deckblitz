import { defineCard } from "../define.js";

// EDHREC rank 28010.

const MILL_TEXT = "{U}, Sacrifice this creature: Target player mills three cards.";
const RETURN_TEXT = "Whenever you cast a multicolored spell, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Enigma Eidolon",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${MILL_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Enigma Eidolon from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
