import { defineCard } from "../define.js";

// The Humans are the ones you control as it resolves (rule 611.2c); one that
// comes under your control later doesn't gain it.
const SHIELD_TEXT = "Humans you control gain indestructible until your next turn.";

export default defineCard({
  name: "Lupari Shield",
  art: "https://cards.scryfall.io/art_crop/back/c/a/ca1cedd8-98d3-408f-8de8-fa682ab0227c.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: `${SHIELD_TEXT} (Then exile this card. You may cast the creature later from exile.)`,
  targets: [],
  effect: {
    kind: "grant-keyword-all",
    filter: { subtype: "Human", controlledBy: "you" },
    keyword: "indestructible",
    duration: "until-your-next-turn",
  },
  faces: ["Karvanista, Loyal Lupari", "Lupari Shield"],
  adventure: true,
});
