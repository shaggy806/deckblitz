import { defineCard } from "../define.js";

export default defineCard({
  name: "Fade from Memory",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{B}" },
  text: "Exile target card from a graveyard.\nCycling {B} ({B}, Discard this card: Draw a card.)",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: { kind: "exile", target: 0 },
});
