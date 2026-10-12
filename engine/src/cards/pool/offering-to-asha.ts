import { defineCard } from "../define.js";

export default defineCard({
  name: "Offering to Asha",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {4}. You gain 4 life.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{4}", text: "Pay {4}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "gain-life", amount: 4 },
    ],
  },
});
