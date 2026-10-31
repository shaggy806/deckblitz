import { defineCard } from "../define.js";

// EDHREC rank 5791.
//
// "Up to X" counters of whatever kinds its controller chooses as it resolves
// (the `remove-counters` decision); the pump reads how many came off.

const TEXT =
  "{X}{B/P}: Remove up to X counters from target permanent. For each counter removed this way, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Hex Parasite",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 1,
  toughness: 1,
  text: `${TEXT} ({B/P} can be paid with either {B} or 2 life.)`,
  activated: [
    {
      cost: { mana: "{X}{B/P}", tap: false },
      targets: ["permanent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counters", target: 0, counter: "any", count: "x", upTo: true },
          {
            kind: "modify-pt",
            target: "source",
            power: { thisWay: "counters-removed" },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
