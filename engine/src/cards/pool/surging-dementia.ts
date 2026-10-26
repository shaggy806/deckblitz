import { defineCard } from "../define.js";
import { ripple } from "../helpers.js";

export default defineCard({
  name: "Surging Dementia",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Ripple 4 (When you cast this spell, you may reveal the top four cards of your library. You may cast spells with the same name as this spell from among those cards without paying their mana costs. Put the rest on the bottom of your library.)\nTarget player discards a card.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
  triggered: [ripple(4, "Surging Dementia")],
});
