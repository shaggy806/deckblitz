import { defineCard } from "../define.js";

const GRANTED_TEXT =
  "When this creature dies, you may pay {W}{W}. If you do, return this card to the battlefield under your control.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${GRANTED_TEXT}"`;

// Ruling (2013-04-15): the seven cards must be there before it dies — the
// dies trigger looks back to the battlefield (rule 603.10a), so the Hero
// itself isn't counted.
export default defineCard({
  name: "Reborn Hero",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Pay {W}{W} to return Reborn Hero to the battlefield?",
            cost: "{W}{W}",
            effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
