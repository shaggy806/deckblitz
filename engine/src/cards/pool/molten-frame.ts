import { defineCard } from "../define.js";

export default defineCard({
  name: "Molten Frame",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Destroy target artifact creature.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
  effect: { kind: "destroy", target: 0 },
});
