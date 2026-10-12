import { defineCard } from "../define.js";

export default defineCard({
  name: "Thornado",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{1}{G}" },
  text: "Destroy target creature with flying.\nCycling {1}{G} ({1}{G}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
});
