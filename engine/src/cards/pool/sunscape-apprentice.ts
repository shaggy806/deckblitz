import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunscape Apprentice",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{G}, {T}: Target creature gets +1/+1 until end of turn.\n{U}, {T}: Put target creature you control on top of its owner's library.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, {T}: Target creature gets +1/+1 until end of turn.",
    },
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "{U}, {T}: Put target creature you control on top of its owner's library.",
    },
  ],
});
