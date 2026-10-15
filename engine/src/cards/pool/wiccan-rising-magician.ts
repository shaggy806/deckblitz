import { defineCard } from "../define.js";

// EDHREC rank 16988.
//
// Flickerwisp's flicker off a noncreature cast: the card comes back as a new
// object under its owner's control as the next end step begins.
const FLICKER_TEXT =
  "Whenever you cast a noncreature spell, exile another target nonland, nontoken permanent. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Wiccan, Rising Magician",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Warlock", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${FLICKER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { notTypes: ["land"], token: false } } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
