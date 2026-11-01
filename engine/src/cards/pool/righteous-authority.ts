import { defineCard } from "../define.js";

// Dissension. "Its controller's hand" is the enchanted creature's
// controller's, whoever controls the Aura; the extra draw is theirs too, put
// on the stack after the turn's draw (the ruling).

const PUMP = "Enchanted creature gets +1/+1 for each card in its controller's hand.";
const DRAW =
  "At the beginning of the draw step of enchanted creature's controller, that player draws an additional card.";

export default defineCard({
  name: "Righteous Authority",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${DRAW}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { cardsInHand: "affected-controller", pt: [1, 1] },
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "active-player" },
      resolve: null,
      text: DRAW,
    },
  ],
});
