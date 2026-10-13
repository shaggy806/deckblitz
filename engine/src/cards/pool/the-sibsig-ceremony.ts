import { defineCard } from "../define.js";

// EDHREC rank 9018.
// Makes Zombie Druid → "Zombie Druid Token".
//
// "If you cast it" is an intervening if (rule 603.4): read off how the
// creature entered as it triggers (the trigger's filter) and again as it
// resolves (the conditional, which reads a creature gone since as it last
// existed). The token comes whether or not the destroy did anything.

const TRIGGER_TEXT =
  "Whenever a creature you control enters, if you cast it, destroy that creature, then create a 2/2 black Zombie Druid creature token.";
const COST_TEXT = "Creature spells you cast cost {2} less to cast.";

export default defineCard({
  name: "The Sibsig Ceremony",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${COST_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, caster: "you", reduceGeneric: 2 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", cast: true, castBy: "you" },
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { cast: true, castBy: "you" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: "trigger-object" },
            { kind: "create-token", token: "Zombie Druid Token", count: 1 },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
