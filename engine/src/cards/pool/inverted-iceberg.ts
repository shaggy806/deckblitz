import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 14333.
export default defineCard({
  name: "Inverted Iceberg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: "When this artifact enters, mill a card, then draw a card. (To mill a card, put the top card of your library into your graveyard.)\nCraft with artifact {4}{U}{U} ({4}{U}{U}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "When this artifact enters, mill a card, then draw a card.",
    },
  ],
  activated: [craft("{4}{U}{U}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {4}{U}{U}")],
  faces: ["Inverted Iceberg", "Iceberg Titan"],
  transform: true,
});
