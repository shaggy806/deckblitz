import { defineCard } from "../define.js";

// EDHREC rank 24671. "Remove that many" is offered only with that many there, so
// a Magistrate short of counters can't lose them for nothing.

const TEXT =
  "Whenever another nontoken creature you control dies, if its mana value was 1 or greater, you may remove that many reprieve counters from this creature. If you do, return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Magnanimous Magistrate",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 4,
  text: `This creature enters with five reprieve counters on it.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "reprieve", amount: 5 } },
      text: "This creature enters with five reprieve counters on it.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", token: false, manaValue: { op: "gte", n: 1 } },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "amounts",
          left: { countersOn: "source", counter: "reprieve" },
          op: "gte",
          right: { manaValueOf: "trigger-object" },
        },
        then: {
          kind: "may",
          prompt: "Remove that many reprieve counters to return that card to the battlefield?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "remove-counter", target: "source", counter: "reprieve", amount: { manaValueOf: "trigger-object" } },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "counters-removed" },
                then: { kind: "put-onto-battlefield", target: "trigger-object" },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
