import { defineCard } from "../define.js";

export default defineCard({
  name: "Kayla's Music Box",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: "{W}, {T}: Look at the top card of your library, then exile it face down. (You may look at it any time.)\n{T}: Until end of turn, you may play cards you own exiled with Kayla's Music Box.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      resolve: null,
      text: "{W}, {T}: Look at the top card of your library, then exile it face down. (You may look at it any time.)",
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, faceDown: "looked", linked: true },
    },
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: "{T}: Until end of turn, you may play cards you own exiled with Kayla's Music Box.",
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, play: true, spell: { ownedBy: "you" } } },
    },
  ],
});
