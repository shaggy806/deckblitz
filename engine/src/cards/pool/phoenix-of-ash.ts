import { defineCard } from "../define.js";

export default defineCard({
  name: "Phoenix of Ash",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: "Flying, haste\n{2}{R}: This creature gets +2/+0 until end of turn.\nEscape—{2}{R}{R}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with a +1/+1 counter on it.",
  escape: { cost: "{2}{R}{R}", exileCount: 3, counters: { kind: "+1/+1", amount: 1 } },
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{R}: This creature gets +2/+0 until end of turn.",
    },
  ],
});
