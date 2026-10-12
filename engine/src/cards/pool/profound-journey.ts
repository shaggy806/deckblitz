import { defineCard } from "../define.js";

export default defineCard({
  name: "Profound Journey",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  rebound: true,
  text: "Return target permanent card from your graveyard to the battlefield.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
});
