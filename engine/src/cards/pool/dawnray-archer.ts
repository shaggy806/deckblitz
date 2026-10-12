import { defineCard } from "../define.js";

export default defineCard({
  name: "Dawnray Archer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 1,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{W}, {T}: This creature deals 1 damage to target attacking or blocking creature.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{W}, {T}: This creature deals 1 damage to target attacking or blocking creature.",
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
