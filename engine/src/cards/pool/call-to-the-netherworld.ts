import { defineCard } from "../define.js";

export default defineCard({
  name: "Call to the Netherworld",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  madness: { cost: "{0}" },
  text: "Return target black creature card from your graveyard to your hand.\nMadness {0} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", colors: ["B"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
