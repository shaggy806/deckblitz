import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Reanimate, the pool's
// own card. Search for Azcanta's shape: the graveyard is counted after the
// surveil, as the ability resolves — not an intervening if.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your " +
  `graveyard, this creature becomes prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Grave Researcher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Troll", "Warlock"],
  power: 3,
  toughness: 3,
  prepareSpell: "Reanimate",
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature" } },
            then: { kind: "become-prepared", target: "source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
