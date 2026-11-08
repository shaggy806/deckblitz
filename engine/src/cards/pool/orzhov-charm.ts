import { defineCard } from "../define.js";

// The Auras aren't targeted, and another player's goes to the graveyard as the
// creature leaves (the rulings). Toughness as it last existed; the life is lost
// even if it isn't destroyed (the rulings).
const RETURN_HAND = "Return target creature you control and all Auras you control attached to it to their owner's hand.";
const DESTROY = "Destroy target creature and you lose life equal to its toughness.";
const RETURN_FIELD = "Return target creature card with mana value 1 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Orzhov Charm",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: `Choose one —\n• ${RETURN_HAND}\n• ${DESTROY}\n• ${RETURN_FIELD}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: RETURN_HAND,
        targets: ["creature-you-control"],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand-all", filter: { subtype: "Aura", controlledBy: "you", attachedToObject: 0 } },
            { kind: "return-to-hand", target: 0 },
          ],
        },
      },
      {
        text: DESTROY,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "lose-life", amount: { toughnessOf: 0 } },
          ],
        },
      },
      {
        text: RETURN_FIELD,
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 1 } } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
    ],
  },
});
