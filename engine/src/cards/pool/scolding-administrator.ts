import { defineCard } from "../define.js";

// EDHREC rank 17999. Repartee is Stirring Hopesinger's trigger: the spell
// targeted a creature as it was cast (the ruling). The dies trigger puts the
// same number of each kind of counter it had, -1/-1 counters included, read
// as it last existed (Iron Apprentice's shape; the rulings).
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, if it had counters on it, put those counters on up to one target creature.";

export default defineCard({
  name: "Scolding Administrator",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${REPARTEE_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: REPARTEE_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 1 } },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
