import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 23862. Counted on resolution (the ruling).

export default defineCard({
  name: "Blossoming Wreath",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain life equal to the number of creature cards in your graveyard.",
  effect: { kind: "gain-life", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
});
