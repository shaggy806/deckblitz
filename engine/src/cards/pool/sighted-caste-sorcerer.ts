import { defineCard } from "../define.js";

export default defineCard({
  name: "Sighted-Caste Sorcerer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 1,
  toughness: 1,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{U}: This creature gains shroud until end of turn. (It can't be the target of spells or abilities.)",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{U}: This creature gains shroud until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exalted",
    },
  ],
});
