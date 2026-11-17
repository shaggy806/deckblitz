import { defineCard } from "../define.js";

// A characteristic-defining ability (rule 604.3) read in every zone: twice
// the count is the count added to itself (`sum`, as the Dog Illusion token
// reads "twice the number of cards in your hand"). The discount is for the
// first instant or sorcery spell its controller casts each turn, skipped once
// one has been cast this turn (`firstEachTurn`).

const PT_TEXT =
  "Melek's power and toughness are each equal to twice the number of instant and sorcery cards in your graveyard.";
const COST_TEXT = "The first instant or sorcery spell you cast each turn costs {3} less to cast.";

const SPELLS_IN_GRAVEYARD = { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } } as const;

export default defineCard({
  name: "Melek, Reforged Researcher",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Weird", "Detective"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { sum: [SPELLS_IN_GRAVEYARD, SPELLS_IN_GRAVEYARD] }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: 3,
        when: { caster: "you", firstEachTurn: true },
      },
      text: COST_TEXT,
    },
  ],
});
