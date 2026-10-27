import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 29030.

const TEXT = "{G}: Target Beast creature gains trample until end of turn.";

export default defineCard({
  name: "Krosan Groundshaker",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Beast" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
