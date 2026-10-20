import { defineCard } from "../define.js";

// +1 is "doesn't untap" alone (`onlyDoesntUntap`): a permanent already tapped
// stays tapped through its controller's next untap step, an untapped one isn't
// tapped. −7 reads "lands" from the target player's side (`controlledByTarget`).
const PLUS_TEXT = "+1: Target permanent doesn't untap during its controller's next untap step.";
const MINUS_TWO_TEXT = "−2: Ajani deals 3 damage to any target and you gain 3 life.";
const MINUS_SEVEN_TEXT = "−7: Destroy all lands target player controls.";

export default defineCard({
  name: "Ajani Vengeant",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TWO_TEXT}\n${MINUS_SEVEN_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["permanent"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: MINUS_TWO_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "destroy-all", filter: { type: "land", controlledBy: "you" }, controlledByTarget: 0 },
      resolve: null,
      text: MINUS_SEVEN_TEXT,
    },
  ],
});
