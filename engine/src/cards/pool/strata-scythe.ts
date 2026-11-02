import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const IMPRINT_TEXT = "Imprint — When this Equipment enters, search your library for a land card, exile it, then shuffle.";
const BONUS_TEXT = "Equipped creature gets +1/+1 for each land on the battlefield with the same name as the exiled card.";

// The search's exile is linked to this permanent (rule 607.2a). Every player's
// lands count, read live; with nothing exiled, none does.
export default defineCard({
  name: "Strata Scythe",
  manaCost: "{3}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${IMPRINT_TEXT}\n${BONUS_TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land" },
        destination: "exile",
        linked: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "land", sameNameWith: "exiled-with-source" }, pt: [1, 1] },
      text: BONUS_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
