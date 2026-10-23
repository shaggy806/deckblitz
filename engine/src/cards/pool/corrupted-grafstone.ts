import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Choose a color of a card in your graveyard. Add one mana of that color.";

// The Grey Havens' `colorAmong` over the controller's graveyard: colourless
// cards add nothing, so an all-colourless graveyard makes no mana (the
// ruling: "you can't add {C} this way").
export default defineCard({
  name: "Corrupted Grafstone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { colorAmong: {}, zone: "graveyard" }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
