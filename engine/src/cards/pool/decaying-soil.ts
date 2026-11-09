import { defineCard } from "../define.js";

// The granted trigger looks back (rule 603.10a): the creature whose death makes
// the seventh card doesn't trigger it (the ruling).
const GRANTED_TEXT =
  "Whenever a nontoken creature is put into your graveyard from the battlefield, you may pay {1}. If you do, return that card to your hand.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this enchantment has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Decaying Soil",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, exile a card from your graveyard.\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "look-and-choose", zone: "graveyard", min: 1, max: 1, destination: "exile", leftover: "stay" },
      resolve: null,
      text: "At the beginning of your upkeep, exile a card from your graveyard.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, ownedBy: "you" } },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Pay {1} to return that card to your hand?",
            cost: "{1}",
            effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
