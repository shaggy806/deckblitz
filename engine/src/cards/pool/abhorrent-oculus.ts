import { defineCard } from "../define.js";

// EDHREC rank 5544. Any six cards (`additionalCost.exileFromGraveyard` with no
// filter), chosen as they're paid with the spell on the stack (601.2h).
const UPKEEP_TEXT =
  "At the beginning of each opponent's upkeep, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Abhorrent Oculus",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Eye"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `As an additional cost to cast this spell, exile six cards from your graveyard.\nFlying\n${UPKEEP_TEXT}`,
  additionalCost: { exileFromGraveyard: { count: 6 } },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
