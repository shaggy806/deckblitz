import { defineCard } from "../define.js";

// EDHREC rank 20076.

export default defineCard({
  name: "Soulless Revival",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{1}{B}" },
  text: "Return target creature card from your graveyard to your hand.\nSplice onto Arcane {1}{B} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
