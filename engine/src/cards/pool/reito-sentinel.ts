import { defineCard } from "../define.js";

export default defineCard({
  name: "Reito Sentinel",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender\nWhen this creature enters, target player mills three cards. (They put the top three cards of their library into their graveyard.)\n{3}: Put target card from a graveyard on the bottom of its owner's library.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{3}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: "When this creature enters, target player mills three cards.",
    },
  ],
});
