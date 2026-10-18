import { defineCard } from "../define.js";

// "You may put a permanent card": `min: 0` is the "may", and a permanent card
// is any card that isn't an instant or a sorcery (The Ur-Dragon's shape).

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a permanent card from your hand onto the battlefield.";

export default defineCard({
  name: "Leyline Surge",
  art: "https://cards.scryfall.io/art_crop/back/5/f/5f80764e-8fa2-44e2-84c6-3b55f1c40ee7.jpg",
  colors: ["G"],
  types: ["enchantment"],
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { notTypes: ["instant", "sorcery"] },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Invasion of Shandalar", "Leyline Surge"],
  transform: true,
});
