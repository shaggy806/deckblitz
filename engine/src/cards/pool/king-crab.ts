import { defineCard } from "../define.js";

export default defineCard({
  name: "King Crab",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 4,
  toughness: 5,
  text: "{1}{U}, {T}: Put target green creature on top of its owner's library.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "{1}{U}, {T}: Put target green creature on top of its owner's library.",
    },
  ],
});
