import { defineCard } from "../define.js";

// EDHREC rank 28071. Both return as one event. With its one target illegal
// as it resolves, the whole ability does nothing (rule 608.2b), so this
// creature stays too.
const TEXT = "{1}, {T}: Return this creature and target green or blue creature you control to their owner's hand.";

export default defineCard({
  name: "Snow Hound",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["U"] }] },
        },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: "source" },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
