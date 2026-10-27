import { defineCard } from "../define.js";

const ETB = "When this land enters, sacrifice it unless you return an untapped Island you control to its owner's hand.";

export default defineCard({
  name: "Coral Atoll",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${ETB}\n{T}: Add {C}{U}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{U}.",
    },
  ],
  triggered: [
    {
      // A trigger, not a replacement (the ruling): Coral Atoll itself, tapped
      // as it entered, can't be the Island returned.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Island", controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return an untapped Island you control to its owner's hand, or sacrifice Coral Atoll",
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "returned-to-hand" } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
