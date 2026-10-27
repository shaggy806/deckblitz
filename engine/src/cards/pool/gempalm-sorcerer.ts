import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 29118.
//
// Every Wizard creature gains flying, each player's.

export default defineCard({
  name: "Gempalm Sorcerer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 2,
  toughness: 2,
  cycling: { cost: "{2}{U}" },
  text: "Cycling {2}{U} ({2}{U}, Discard this card: Draw a card.)\nWhen you cycle this card, Wizard creatures gain flying until end of turn.",
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: { kind: "grant-keyword-all", filter: { type: "creature", subtype: "Wizard" }, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "When you cycle this card, Wizard creatures gain flying until end of turn.",
    },
  ],
});
