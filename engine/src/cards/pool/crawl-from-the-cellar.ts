import { defineCard } from "../define.js";

export default defineCard({
  name: "Crawl from the Cellar",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{3}{B}" },
  text: "Return target creature card from your graveyard to your hand. Put a +1/+1 counter on up to one target Zombie you control.\nFlashback {3}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
    { kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Zombie" } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
