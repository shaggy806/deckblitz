import { defineCard } from "../define.js";

const TEXT =
  "{3}{U}, {T}: Exile another target creature you control, then return that card to the battlefield under your control.";

export default defineCard({
  name: "Nephalia Smuggler",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "flicker", target: 0, underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
