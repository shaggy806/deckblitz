import { defineCard } from "../define.js";

export default defineCard({
  name: "Magosi, the Waterveil",
  manaCost: "",
  colors: [],
  types: ["land"],
  text:
    "This land enters tapped.\n" +
    "{T}: Add {U}.\n" +
    "{U}, {T}: Put an eon counter on this land. Skip your next turn.\n" +
    "{T}, Remove an eon counter from this land and return it to its owner's hand: Take an extra turn after this one.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "eon", amount: 1 },
          { kind: "skip-turn", who: "you" },
        ],
      },
      resolve: null,
      text: "{U}, {T}: Put an eon counter on this land. Skip your next turn.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "eon", count: 1 }, returnSelfToHand: true },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: "{T}, Remove an eon counter from this land and return it to its owner's hand: Take an extra turn after this one.",
    },
  ],
});
