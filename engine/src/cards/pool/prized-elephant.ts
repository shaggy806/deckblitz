import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 28377.

export default defineCard({
  name: "Prized Elephant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 3,
  text: "This creature gets +1/+1 as long as you control a Forest.\n{G}: This creature gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Forest.",
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "{G}: This creature gains trample until end of turn.",
    },
  ],
});
