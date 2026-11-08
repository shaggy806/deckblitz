import { defineCard } from "../define.js";

// The creature is target 0 and the Equipment the group after it, each
// attached in turn (rule 701.3a; one that can't legally go there, or is
// there already, stays as it is: 701.3b). "When one or more Equipment become
// attached to that creature this way" is a reflexive ability (rule 603.12),
// triggered only if one was; "that creature" is its trigger object, followed
// from this stint (rule 400.7), and it deals the damage as it is then.
const TEXT =
  "When Thorin enters, attach any number of target Equipment you control to target creature you control. When one or more Equipment become attached to that creature this way, that creature deals damage equal to its power to up to one target creature.";
const WHEN_TEXT =
  "When one or more Equipment become attached to that creature this way, that creature deals damage equal to its power to up to one target creature.";

export default defineCard({
  name: "Thorin, Mountain-king",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dwarf", "Noble"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "you", filter: { type: "creature" } },
        { kind: "any-number", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 1, effect: { kind: "attach", target: 0, attachment: 1 } },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "attached" },
            then: {
              kind: "reflexive-trigger",
              about: 0,
              targets: [{ kind: "optional", of: { kind: "permanent", whose: "any", filter: { type: "creature" } } }],
              effect: { kind: "damage", from: "trigger-object", amount: { powerOf: "trigger-object" }, target: 0 },
              text: WHEN_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
