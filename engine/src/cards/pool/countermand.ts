import { defineCard } from "../define.js";

// Born of the Gods (BNG). EDHREC rank 14303. The mill reads the countered
// spell's controller from the slot (Broken Ambitions' shape), so a spell that
// can't be countered still has its controller mill (the ruling).

export default defineCard({
  name: "Countermand",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Its controller mills four cards.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "mill", target: 0, amount: 4 },
    ],
  },
});
