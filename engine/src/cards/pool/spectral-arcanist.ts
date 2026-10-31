import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this creature enters, you may cast an instant or sorcery spell with mana value less than or equal to the number of Spirits you control from a graveyard without paying its mana cost. If that spell would be put into a graveyard, exile it instead.";

// Cast as the trigger resolves or not at all (its ruling), from any
// player's graveyard (`from: "any-graveyard"`), X 0 (rule 107.3b); the
// Spirits are counted as it resolves. A spell cast from another player's
// graveyard is the caster's to control (rule 108.3).
export default defineCard({
  name: "Spectral Arcanist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "any-graveyard",
        free: true,
        exileAfter: true,
        spell: {
          typesAnyOf: ["instant", "sorcery"],
          manaValue: { op: "lte", n: { amount: { countOf: { subtype: "Spirit", controlledBy: "you" } } } },
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
