import { defineCard } from "../define.js";
import { addManaAbility, maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 11965. A creature's {T} mana ability, so not while it's
// summoning sick (rule 302.6).
const MANA_TEXT = "{T}: Add {R}{R}.";

export default defineCard({
  name: "Endrider Catalyzer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\nMax speed — ${MANA_TEXT}`,
  static: [
    maxSpeed({
      grantsActivated: [addManaAbility({ mana: "R", amount: 2, text: MANA_TEXT })],
      text: `Max speed — ${MANA_TEXT}`,
    }),
  ],
});
