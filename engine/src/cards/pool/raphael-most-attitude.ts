import { defineCard } from "../define.js";

export default defineCard({
  name: "Raphael, Most Attitude",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nAlliance — Whenever another creature you control enters, you may exile the top card of your library.\nWhenever Raphael attacks, until end of turn, you may play a card exiled with Raphael.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      resolve: null,
      text: "Alliance — Whenever another creature you control enters, you may exile the top card of your library.",
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile the top card of your library?",
        effect: { kind: "exile-from-library", amount: 1, linked: true },
      },
    },
    {
      trigger: { on: "attacks", who: "self" },
      resolve: null,
      text: "Whenever Raphael attacks, until end of turn, you may play a card exiled with Raphael.",
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, play: true, upTo: 1 } },
    },
  ],
});
