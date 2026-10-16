import { defineCard } from "../define.js";

// EDHREC rank 8265.

export default defineCard({
  name: "Wasteland Raider",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 4,
  toughness: 3,
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)\nWhen this creature enters, each player sacrifices a creature of their choice.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true },
      resolve: null,
      text: "When this creature enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When this creature enters, each player sacrifices a creature of their choice.",
    },
  ],
});
