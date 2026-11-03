import { defineCard } from "../define.js";

// Fate Reforged. "It" is the card this resolution manifested (rule 701.40a);
// with an empty library nothing is manifested and no counter is put.
const TEXT =
  "Manifest the top card of your library, then put a +1/+1 counter on it. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Formless Nurturing",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "manifest", who: "you" },
      { kind: "add-counter-all", filter: { thisWay: "put-onto-battlefield" }, counter: "+1/+1", amount: 1 },
    ],
  },
});
