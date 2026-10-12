import { defineCard } from "../define.js";

export default defineCard({
  name: "Grixis Battlemage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{U}, {T}: Draw a card, then discard a card.\n{R}, {T}: Target creature can't block this turn.",
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
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{R}, {T}: Target creature can't block this turn.",
    },
  ],
});
