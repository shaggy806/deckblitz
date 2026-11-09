import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, exile the top card of your library face down. You may look at that card for as long as it remains exiled.";
const PLAY_TEXT = "Once during each of your turns, you may play a land or cast a spell from among the cards exiled with this permanent without paying its mana cost.";

export default defineCard({
  name: "Hauken's Insight",
  art: "https://cards.scryfall.io/art_crop/back/6/b/6b4529c3-8edb-4909-b910-806450a39d2e.jpg",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, faceDown: "looked", linked: true },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "exile", play: true, filter: {}, linked: true, free: true, oncePerTurn: true, yourTurnOnly: true },
      text: PLAY_TEXT,
    },
  ],
  faces: ["Jacob Hauken, Inspector", "Hauken's Insight"],
  transform: true,
});
