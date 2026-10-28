import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 24514.
//
// The name is chosen as it enters (`chooseCardNameOnEnter`); the named lands
// lose their land types (layer 4) and every ability (layer 6) and have the
// any-colour mana ability from the same static, so it stays (rule 613.7). A
// land with that name entering later loses its "enters tapped" and "as this
// enters" abilities before they apply, and its enters triggers with them (the
// rulings; rule 614.12 — `entersWithoutAbilities`). Its supertypes and other
// card types stay.

const LANDS_TEXT =
  'Lands your opponents control with the chosen name lose all land types and abilities, and they gain "{T}: Add one mana of any color."';

export default defineCard({
  name: "Alpine Moon",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose a nonbasic land card name.\n${LANDS_TEXT}`,
  chooseCardNameOnEnter: { filter: { types: ["land"], nonbasic: true }, aim: "opponent-permanents" },
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "opponent", chosenName: true } },
      loseLandTypes: true,
      loseAllAbilities: true,
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      text: LANDS_TEXT,
    },
  ],
});
