import { defineCard } from "../define.js";

// EDHREC rank 12911. One X: the mana's and the cards exiled.
export default defineCard({
  name: "Skeletal Scrying",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, exile X cards from your graveyard.\nYou draw X cards and you lose X life.",
  additionalCost: { exileFromGraveyard: { count: "x" } },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      { kind: "lose-life", amount: "x" },
    ],
  },
});
