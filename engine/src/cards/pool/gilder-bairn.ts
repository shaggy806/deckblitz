import { defineCard } from "../define.js";

export default defineCard({
  name: "Gilder Bairn",
  manaCost: "{1}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 3,
  text: "{2}{G/U}, {Q}: Double the number of each kind of counter on target permanent. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{2}{G/U}", tap: false, untap: true },
      targets: ["permanent"],
      effect: { kind: "double-counters", target: 0 },
      resolve: null,
      text: "{2}{G/U}, {Q}: Double the number of each kind of counter on target permanent.",
    },
  ],
});
