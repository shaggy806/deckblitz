import { defineCard } from "../define.js";

// "For each kind of counter among creatures you control": `keyword-counters`
// with `keywords: "every-kind"`, each kind read once the Fish are made, and
// each counter put on one of "those tokens" (`thisWay: "created"`) chosen for
// it — not a target.
export default defineCard({
  name: "Exotic Pets",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Create two 1/1 blue Fish creature tokens with \"This token can't be blocked.\" Then for each kind of counter among creatures you control, put a counter of that kind on either of those tokens.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Fish Token (Expendable Lackey)", count: 2 },
      {
        kind: "keyword-counters",
        from: { type: "creature", controlledBy: "you" },
        keywords: "every-kind",
        onto: { type: "creature", thisWay: "created" },
      },
    ],
  },
});
