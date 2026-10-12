import { defineCard } from "../define.js";

export default defineCard({
  name: "Hoverstone Pilgrim",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n{2}: Put target card from a graveyard on the bottom of its owner's library.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{2}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
});
