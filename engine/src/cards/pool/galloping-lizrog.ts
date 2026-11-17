import { defineCard } from "../define.js";

// EDHREC rank 11585.
//
// Rulings:
//   [2019-01-25] If Galloping Lizrog leaves the battlefield after its ability has triggered, you
//     may remove any number of +1/+1 counters from among your creatures, even though you won't put
//     any on Galloping Lizrog.
//   [2019-01-25] If an effect causes Galloping Lizrog to enter the battlefield with +1/+1 counters
//     on it, you may remove those counters with its triggered ability and put twice as many back
//     on it.
//   [2019-01-25] You remove counters and put new ones on Galloping Lizrog all while its ability is
//     resolving. Nothing can happen between the two, and no player may choose to take actions.
//
// "Any number of +1/+1 counters from among creatures you control" is chosen as it resolves (the
// `remove-counters` decision, `count: "any"`, `among`), none at all included and this creature's
// own counters too (the second ruling); twice the counters removed this way go back on it, so
// none removed puts none (the "if you do"). Gone by then, it gets nothing (the first ruling).

const ENTER_TEXT =
  "When this creature enters, you may remove any number of +1/+1 counters from among creatures you control. If you do, put twice that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Galloping Lizrog",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Frog", "Lizard"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counters", from: { type: "creature" }, counter: "+1/+1", count: "any", among: true },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { product: [{ thisWay: "counters-removed" }, 2] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
