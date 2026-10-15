import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 23898. Secrets of Strixhaven.
//
// Repartee asks only what the spell targeted as it was cast: it triggers, and
// resolves, however those creatures fare (the rulings), and resolves before
// the spell, even one that's countered.
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gets +1/+0 and gains lifelink until end of turn.";

export default defineCard({
  name: "Inkshape Demonstrator",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 3,
  toughness: 4,
  text: `Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${REPARTEE_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
