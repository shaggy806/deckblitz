import { defineCard } from "../define.js";

export default defineCard({
  name: "Neyali, Suns' Vanguard",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Rebel"],
  power: 3,
  toughness: 3,
  text: "Attacking tokens you control have double strike.\nWhenever one or more tokens you control attack a player, exile the top card of your library. During any turn you attacked with a token, you may play that card.",
  static: [
    {
      affects: { scope: "filter", filter: { token: true, attacking: true, controlledBy: "you" } },
      grantKeywords: ["double-strike"],
      text: "Attacking tokens you control have double strike.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", filter: { token: true } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "while-exiled", play: true, sourceDid: "attacked-with-a-token" },
      resolve: null,
      text: "Whenever one or more tokens you control attack a player, exile the top card of your library. During any turn you attacked with a token, you may play that card.",
    },
  ],
});
