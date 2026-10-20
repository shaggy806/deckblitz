import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2).
//
// The upkeep ability works only from the graveyard (`fromGraveyard`), and its
// "if this card is in your graveyard" is an intervening if (rule 603.4),
// asked again as it resolves: gone from the graveyard by then, nothing is
// asked and no life is paid. Genesis's shape, with Squee's return.
const SURVEIL_TEXT = "When this creature enters, surveil 2.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if this card is in your graveyard, you may pay 1 life. If you do, return it to your hand.";

export default defineCard({
  name: "Master of Death",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\nAt the beginning of your upkeep, if this card is in your graveyard, you may pay 1 life. If you do, return it to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 1 life to return Master of Death to your hand?",
        costLife: 1,
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
