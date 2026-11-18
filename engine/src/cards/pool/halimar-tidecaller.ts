import { defineCard } from "../define.js";

// EDHREC rank 17171.
//
// "A card with awaken" is `hasKeyword: "awaken"`: a card whose definition holds
// an awaken cost (`overload.keyword`, rule 702.113a), as `CardFilter` reads it
// on a card in a graveyard. The flying grant is Tatyova's.
const RETURN_TEXT = "When this creature enters, you may return target card with awaken from your graveyard to your hand.";
const FLYING_TEXT = "Land creatures you control have flying.";

export default defineCard({
  name: "Halimar Tidecaller",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Ally"],
  power: 2,
  toughness: 3,
  text: `${RETURN_TEXT}\n${FLYING_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["land", "creature"], controlledBy: "you" } },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { hasKeyword: "awaken" } }],
      effect: {
        kind: "may",
        prompt: "Return target card with awaken from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
