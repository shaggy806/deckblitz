import { defineCard } from "../define.js";

const COST_TEXT = "Aura spells you cast cost {1} less to cast.";
const HEROIC_TEXT = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Hero of Iroas",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${COST_TEXT}\n${HEROIC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtypes: ["Aura"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
