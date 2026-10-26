import { defineCard } from "../define.js";

const SAC_TEXT = "Whenever Nefarox attacks alone, defending player sacrifices a creature of their choice.";

export default defineCard({
  name: "Nefarox, Overlord of Grixis",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nExalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n${SAC_TEXT}`,
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
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
