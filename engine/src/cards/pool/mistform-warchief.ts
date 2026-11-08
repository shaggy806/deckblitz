import { defineCard } from "../define.js";

const COST_TEXT = "Creature spells you cast that share a creature type with this creature cost {1} less to cast.";
const TYPE_TEXT = "{T}: This creature becomes the creature type of your choice until end of turn.";

export default defineCard({
  name: "Mistform Warchief",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 3,
  text: `${COST_TEXT}\n${TYPE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "creature", sharesCreatureTypeWith: "source" },
        reduceGeneric: 1,
        when: { caster: "you" },
      },
      text: COST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "add-types", target: "source", setSubtypes: ["$chosen"], duration: "end-of-turn" },
      },
      resolve: null,
      text: TYPE_TEXT,
    },
  ],
});
