import { defineCard } from "../define.js";

// EDHREC rank 23613.

export default defineCard({
  name: "Generous Revival",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{4}{W}" },
  text: "Return target creature card with mana value 3 or less from your graveyard to the battlefield with an additional +1/+1 counter on it.\nFlashback {4}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 1 } },
});
