import { defineCard } from "../define.js";

export default defineCard({
  name: "Formless Genesis",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["kindred", "sorcery"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  retrace: true,
  text: "Changeling (This card is every creature type.)\nCreate an X/X colorless Shapeshifter creature token with changeling and deathtouch, where X is the number of land cards in your graveyard.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: {
    kind: "create-token",
    token: "Shapeshifter Token (X/X Changeling Deathtouch)",
    count: 1,
    basePt: { power: { countInGraveyard: { type: "land", ownedBy: "you" } }, toughness: { countInGraveyard: { type: "land", ownedBy: "you" } } },
  },
});
