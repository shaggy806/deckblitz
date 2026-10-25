import { defineCard } from "../define.js";

// Moldgraf Millipede's count, onto a target: every creature card in your
// graveyard after the mill, not only the milled ones.

export default defineCard({
  name: "Grave Strength",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose target creature. Mill three cards, then put a +1/+1 counter on that creature for each creature card in your graveyard. (To mill three cards, put the top three cards of your library into your graveyard.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
      },
    ],
  },
});
