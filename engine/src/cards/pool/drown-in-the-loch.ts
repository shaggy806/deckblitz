import { defineCard } from "../define.js";

// The graveyard is the target's own controller's, a target filter read when the
// target is chosen and again on resolution (rule 608.2b).

const AT_MOST_THEIR_GRAVEYARD = {
  manaValue: { op: "lte", n: { amount: { graveyardSize: "each" }, forItsController: true } },
} as const;

export default defineCard({
  name: "Drown in the Loch",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell with mana value less than or equal to the number of cards in its controller's graveyard.\n• Destroy target creature with mana value less than or equal to the number of cards in its controller's graveyard.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell with mana value less than or equal to the number of cards in its controller's graveyard.",
        targets: [{ kind: "spell", filter: AT_MOST_THEIR_GRAVEYARD }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Destroy target creature with mana value less than or equal to the number of cards in its controller's graveyard.",
        targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", ...AT_MOST_THEIR_GRAVEYARD } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
