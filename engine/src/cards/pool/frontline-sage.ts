import { defineCard } from "../define.js";

export default defineCard({
  name: "Frontline Sage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 1,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{U}, {T}: Draw a card, then discard a card.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{U}, {T}: Draw a card, then discard a card.",
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
