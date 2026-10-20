import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 16204.
export default defineCard({
  name: "Sarulf's Packmate",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, draw a card.\nForetell {1}{G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{1}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
  ],
});
