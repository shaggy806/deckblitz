import { defineCard } from "../define.js";

// EDHREC rank 4015.
//
// Rulings (abridged):
//   The token copies what was printed on the original Equipment, with the
//   listed exception; its "when this enters" and "as this enters" abilities
//   work.
//   If the copied Equipment has {X} in its mana cost, X is 0.
//
// The exception is a static the copy has (a copiable value, rule 707.9b):
// its "this Equipment" is the token, read as each equip cost is priced
// (`Game.abilityCostModifiers` reads granted statics). "Sacrifice that token"
// is a real delayed triggered ability at the next upkeep, anyone's.
const HASTE_TEXT = "Equipped creatures you control have haste.";
const COPY_TEXT =
  'Whenever a nontoken Equipment you control enters, create a token that\'s a copy of it, except it has "This Equipment\'s equip abilities cost {2} less to activate." Sacrifice that token at the beginning of the next upkeep.';
const DISCOUNT_TEXT = "This Equipment's equip abilities cost {2} less to activate.";

export default defineCard({
  name: "Firion, Wild Rose Warrior",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${HASTE_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Equipment", token: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token-copy",
            of: "trigger-object",
            count: 1,
            who: "you",
            exceptions: {
              static: [
                {
                  affects: { scope: "self" },
                  abilityCostModification: { applies: { isSource: true }, abilityKind: "equip", reduceGeneric: 2 },
                  text: DISCOUNT_TEXT,
                },
              ],
            },
          },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep" },
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice that token at the beginning of the next upkeep.",
          },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
