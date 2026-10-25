import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, each opponent mills three cards.";
const UPKEEP_TEXT =
  "Delirium — At the beginning of each opponent's upkeep, if there are four or more card types among cards in your graveyard, that player mills three cards.";

// "That player" is the opponent whose upkeep it is (Sheoldred, Whispering
// One's `active-player`); delirium is an intervening-if (the rulings).
export default defineCard({
  name: "Manic Scribe",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 3,
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-opponent", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "mill", target: "active-player", amount: 3 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
