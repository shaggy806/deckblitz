import { defineCard } from "../define.js";

// EDHREC rank 10674. Iron Maiden's trigger on a creature.

const TEXT =
  "At the beginning of each opponent's upkeep, this creature deals X damage to that player, where X is the number of cards in their hand minus 4.";

export default defineCard({
  name: "Viseling",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "damage", who: "active-player", amount: { difference: [{ cardsInHand: "active-player" }, 4] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
