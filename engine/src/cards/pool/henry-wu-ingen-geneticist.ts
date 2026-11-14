import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// Henry Wu's own exploit is printed; the other Humans get it from the
// static. The creature exploited is the trigger's object, read as it last
// existed: a Human exploited triggers nothing, whatever its power (the
// rulings), and "had power 3 or greater" is its power as it was sacrificed.
const GRANT_TEXT =
  "Henry Wu and other Human creatures you control have exploit. (When a creature with exploit enters, you may sacrifice a creature.)";
const EXPLOITS_TEXT =
  "Whenever a creature you control exploits a non-Human creature, draw a card. If the exploited creature had power 3 or greater, create a Treasure token.";

export default defineCard({
  name: "Henry Wu, InGen Geneticist",
  manaCost: "{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 1,
  toughness: 4,
  text: `${GRANT_TEXT}\n${EXPLOITS_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Human", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [exploit()],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    exploit(),
    {
      trigger: { on: "exploits", who: "you-control", filter: { type: "creature", notSubtypes: ["Human"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { power: { op: "gte", n: 3 } } },
            then: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: EXPLOITS_TEXT,
    },
  ],
});
