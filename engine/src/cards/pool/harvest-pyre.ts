import { defineCard } from "../define.js";

// EDHREC rank 22833. X is announced as it's cast and exiled as it's paid, so
// it's at most the cards in your graveyard.
export default defineCard({
  name: "Harvest Pyre",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, exile X cards from your graveyard.\nHarvest Pyre deals X damage to target creature.",
  additionalCost: { exileFromGraveyard: { count: "x" } },
  targets: ["creature"],
  effect: { kind: "damage", amount: "x", target: 0 },
});
