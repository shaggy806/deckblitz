import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this enchantment enters, exile all graveyards.";
const COUNTER_TEXT =
  "Whenever a player casts a spell, counter it if a card with the same name is in a graveyard or a nontoken permanent with the same name is on the battlefield.";

// Not an intervening "if": it always triggers, and the check is made as it
// resolves, against the graveyards and the battlefield of that moment (rule
// 608.2c), so a namesake gone in response no longer counters the spell. The
// spell itself is on the stack, in neither.
export default defineCard({
  name: "Bazaar of Wonders",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-player" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            { kind: "trigger-object", filter: { sameNameWith: { graveyard: {} } } },
            { kind: "trigger-object", filter: { sameNameWith: { permanents: { token: false } } } },
          ],
        },
        then: { kind: "counter", target: "trigger-object" },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
