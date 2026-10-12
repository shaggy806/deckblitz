import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Deep Sight, a
// `prepareSpellOnly` file of its own. Landfall makes it prepared — a no-op
// while it already is (the ruling).
const LANDFALL_TEXT = `Landfall — Whenever a land you control enters, Tam becomes prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Tam, Observant Sequencer",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Wizard"],
  power: 4,
  toughness: 3,
  prepareSpell: "Deep Sight",
  text: LANDFALL_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
