import { defineCard } from "../define.js";

// EDHREC rank 4888.
//
// Another permanent's replacement (rule 614.6), judged as the creature would
// exist on the battlefield (614.12): a card cast and resolving isn't touched,
// wherever it was cast from; anything else — reanimated, flickered, put there
// from a hand or library, manifested — is exiled instead. Never itself, nor
// a creature entering with it (the rulings).
const TEXT = "If a nontoken creature would enter and it wasn't cast, exile it instead.";

export default defineCard({
  name: "Containment Priest",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", token: false, cast: false },
        exileInstead: true,
      },
      text: TEXT,
    },
  ],
});
