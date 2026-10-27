import { defineCard } from "../define.js";

// EDHREC rank 14933.
//
// The Bringers' "you may pay {W}{U}{B}{R}{G} rather than pay this spell's
// mana cost" is the card's own `alternativeCost` (Admiral's Order's shape,
// unconditional). The upkeep tutor is Vampiric Tutor's `library-top` search
// behind a `may` that costs 2 life ("If you do").

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may pay 2 life. If you do, search your library for a card, then shuffle and put that card on top.";

export default defineCard({
  name: "Bringer of the Black Dawn",
  manaCost: "{7}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bringer"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  alternativeCost: { mana: "{W}{U}{B}{R}{G}" },
  text: `You may pay {W}{U}{B}{R}{G} rather than pay this spell's mana cost.\nTrample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 2 life to search your library for a card and put it on top?",
        costLife: 2,
        effect: { kind: "search-library", filter: {}, destination: "library-top", min: 1, max: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
