import { defineCard } from "../define.js";

// Rulings:
//   You finish casting a spell, including paying its costs, before Mizzix's first ability
//     triggers. The ability that gives you the experience counter will resolve before the spell.
//   Mizzix's last ability can't reduce the amount of colored mana you pay for a spell.

const TRIGGER =
  "Whenever you cast an instant or sorcery spell with mana value greater than the number of experience counters you have, you get an experience counter.";
const REDUCTION = "Instant and sorcery spells you cast cost {1} less to cast for each experience counter you have.";

export default defineCard({
  name: "Mizzix of the Izmagnus",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${TRIGGER}\n${REDUCTION}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          typesAnyOf: ["instant", "sorcery"],
          manaValue: { op: "gt", n: { amount: { playerCounters: "experience" } } },
        },
      },
      targets: [],
      effect: { kind: "add-player-counters", counter: "experience", amount: 1 },
      resolve: null,
      text: TRIGGER,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: { playerCounters: "experience" },
        when: { caster: "you" },
      },
      text: REDUCTION,
    },
  ],
});
