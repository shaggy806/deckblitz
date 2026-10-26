import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 9127.

const TEXT = "{1}, {T}: Return target creature to its owner's hand unless its controller pays {1}.";

export default defineCard({
  name: "Erratic Portal",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{1}", text: "Pay {1}." }], otherwise: { kind: "return-to-hand", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
