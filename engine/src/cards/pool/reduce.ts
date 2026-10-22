import { defineCard } from "../define.js";

const FACES = ["Reduce // Rubble", "Reduce", "Rubble"];

export default defineCard({
  name: "Reduce",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {3}.",
  targets: ["spell"],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
  faces: FACES,
  split: true,
});
