import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with three +1/+1 counters on it for each {G}{G} spent to cast it.";
const TEXT =
  "When this creature enters, choose up to two other target creatures you control. For each {W}{W} spent to cast this creature, put a +1/+1 counter on each of them.";

// EDHREC rank 22927. Whole pairs of the mana spent (`manaSpentOf`'s `per`).
export default defineCard({
  name: "Clay Champion",
  manaCost: "{X}{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { product: [{ manaSpentOf: "source", type: "G", per: 2 }, 3] } },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "other", of: "creature-you-control" } },
        { kind: "optional", of: { kind: "other", of: { kind: "other", of: "creature-you-control" }, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: { manaSpentOf: "source", type: "W", per: 2 } },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: { manaSpentOf: "source", type: "W", per: 2 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
