import { defineCard } from "../define.js";

// EDHREC rank 15435.

const REDUCTION = "Noncreature spells you cast cost {2} less to cast.";
const TRIGGER = "Whenever you cast a noncreature spell, counter that spell unless you sacrifice a creature.";

export default defineCard({
  name: "Blood Funnel",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${REDUCTION}\n${TRIGGER}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, caster: "you", reduceGeneric: 2 },
      text: REDUCTION,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        otherwise: { kind: "counter", target: "trigger-object" },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
