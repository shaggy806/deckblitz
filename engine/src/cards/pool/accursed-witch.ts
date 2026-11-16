import { defineCard } from "../define.js";

// Its back face is Infectious Curse. "Return it ... transformed ... attached
// to target opponent" (rule 712.14); if an effect transforms it on the
// battlefield instead, the Curse attaches to nothing and goes to the
// graveyard (its ruling — the state-based action, rule 704.5m). The cost
// reduction reaches every spell an opponent casts that targets it, Auras and
// spells with other targets too, and no ability (its rulings).
const COST_TEXT = "Spells your opponents cast that target this creature cost {1} less to cast.";
const DIES_TEXT =
  "When this creature dies, return it to the battlefield transformed under your control attached to target opponent.";

export default defineCard({
  name: "Accursed Witch",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 4,
  toughness: 2,
  text: `${COST_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, targetingSource: true, reduceGeneric: 1, when: { caster: "opponent" } },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: { kind: "put-onto-battlefield", target: "source", transformed: true, underYourControl: true, attachedTo: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Accursed Witch", "Infectious Curse"],
  transform: true,
});
