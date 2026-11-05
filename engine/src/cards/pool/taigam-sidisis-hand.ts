import { defineCard } from "../define.js";

const SKIP_TEXT = "Skip your draw step.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.";
const SHRINK_TEXT = "{B}, {T}, Exile X cards from your graveyard: Target creature gets -X/-X until end of turn.";

export default defineCard({
  name: "Taigam, Sidisi's Hand",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: `${SKIP_TEXT}\n${UPKEEP_TEXT}\n${SHRINK_TEXT}`,
  static: [{ affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: SKIP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: true, exileFromGraveyard: { count: "x" } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: SHRINK_TEXT,
    },
  ],
});
