import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 16796. "Any number of Spirits" is
// Eliminate the Competition's sacrifice of X, X announced as it's cast (none
// at all included) and the Spirits chosen as the cost is paid; a copy keeps
// the X (rule 707.10). "That much" is the life actually lost (Foul-Tongue
// Shriek's reading).
const TEXT =
  "As an additional cost to cast this spell, you may sacrifice any number of Spirits.\nTarget player loses 2 life plus 2 life for each Spirit sacrificed this way. You gain that much life.";

export default defineCard({
  name: "Devouring Greed",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: TEXT,
  additionalCost: { sacrifice: { subtype: "Spirit" }, sacrificeCount: "x" },
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", target: 0, amount: { sum: [2, { product: [2, "x"] }] } },
      { kind: "gain-life", amount: { lifeLostThisWay: true } },
    ],
  },
});
