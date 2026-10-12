import { defineCard } from "../define.js";

export default defineCard({
  name: "Ephemerate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  rebound: true,
  text:
    "Exile target creature you control, then return it to the battlefield under its owner's control.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature-you-control"],
  effect: { kind: "flicker", target: 0 },
});
