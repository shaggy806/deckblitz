import { defineCard } from "../define.js";

// Rulings:
//   If you activate Fleeting Spirit's first ability to give it first strike, you can later
//   activate its last ability to remove it from combat after first strike combat damage is dealt
//   but before normal combat damage is dealt.

const STRIKE_TEXT = "{W}, Exile three cards from your graveyard: This creature gains first strike until end of turn.";
const FLICKER_TEXT =
  "Discard a card: Exile this creature. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Fleeting Spirit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  text: `${STRIKE_TEXT}\n${FLICKER_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false, exileFromGraveyard: { count: 3 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: STRIKE_TEXT,
    },
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: "next-end-step",
        returnText: "Return Fleeting Spirit to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
