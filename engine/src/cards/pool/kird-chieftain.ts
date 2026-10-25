import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 13732.
export default defineCard({
  name: "Kird Chieftain",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 3,
  toughness: 3,
  text: "This creature gets +1/+1 as long as you control a Forest.\n{4}{G}: Target creature gets +2/+2 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
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
      cost: { mana: "{4}{G}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{4}{G}: Target creature gets +2/+2 and gains trample until end of turn.",
    },
  ],
});
