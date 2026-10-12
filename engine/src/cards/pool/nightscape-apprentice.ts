import { defineCard } from "../define.js";

export default defineCard({
  name: "Nightscape Apprentice",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{U}, {T}: Put target creature you control on top of its owner's library.\n{R}, {T}: Target creature gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "{U}, {T}: Put target creature you control on top of its owner's library.",
    },
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "{R}, {T}: Target creature gains first strike until end of turn.",
    },
  ],
});
