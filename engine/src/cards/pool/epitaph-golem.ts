import { defineCard } from "../define.js";

export default defineCard({
  name: "Epitaph Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 5,
  text: "{2}: Put target card from your graveyard on the bottom of your library.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{2}: Put target card from your graveyard on the bottom of your library.",
    },
  ],
});
