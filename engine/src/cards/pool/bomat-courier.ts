import { defineCard } from "../define.js";

export default defineCard({
  name: "Bomat Courier",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nWhenever this creature attacks, exile the top card of your library face down. (You can't look at it.)\n{R}, Discard your hand, Sacrifice this creature: Put all cards exiled with this creature into their owners' hands.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      resolve: null,
      text: "Whenever this creature attacks, exile the top card of your library face down. (You can't look at it.)",
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, faceDown: true, linked: true },
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self", do: { kind: "discard-hand", who: "you" } },
      resolve: null,
      text: "{R}, Discard your hand, Sacrifice this creature: Put all cards exiled with this creature into their owners' hands.",
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
    },
  ],
});
