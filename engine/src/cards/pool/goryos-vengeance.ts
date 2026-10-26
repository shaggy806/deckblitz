import { defineCard } from "../define.js";

// A creature that has left by the end step isn't exiled (the ruling): the delayed exile acts on
// the permanent the card became.
export default defineCard({
  name: "Goryo's Vengeance",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text:
    "Return target legendary creature card from your graveyard to the battlefield. That creature gains haste. Exile it at the beginning of the next end step.\n" +
    "Splice onto Arcane {2}{B} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{2}{B}" },
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { supertype: "legendary", type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "exile", target: 0 },
        text: "Exile the creature Goryo's Vengeance returned to the battlefield.",
      },
    ],
  },
});
