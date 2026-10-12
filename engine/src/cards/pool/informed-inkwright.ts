import { defineCard } from "../define.js";

// EDHREC rank 11683.
//
// Repartee: a cast trigger whose filter asks what the spell targets as it's
// cast (`targets` — Feather, the Redeemed's shape). Once triggered it
// resolves whatever happens to the creature or the spell since (the rulings).
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, create a 1/1 white and black Inkling creature token with flying.";

export default defineCard({
  name: "Informed Inkwright",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${REPARTEE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token (Emeritus of Truce)", count: 1 },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
