import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

const CHAPTERS =
  "I, II, III — Choose a creature card name, then goad all creatures with a name chosen for this enchantment. (Until your next turn, they attack each combat if able and attack a player other than you if able.)";

export default defineCard({
  name: "Day of the Moon",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTERS}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      // Each chapter's name is kept on the Saga (`remember`), so the goad
      // reaches every name chosen for it so far — all creatures, yours too.
      // The name just chosen counts even when the Saga has left and so
      // couldn't keep it (`hasName`).
      effect: {
        kind: "choose-card-name",
        filter: { types: ["creature"] },
        remember: true,
        then: {
          kind: "goad",
          filter: { type: "creature", anyOf: [{ chosenName: true }, { hasName: CHOSEN_CARD_NAME }] },
        },
      },
      resolve: null,
      text: CHAPTERS,
    },
  ],
});
