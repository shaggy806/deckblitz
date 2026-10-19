import { defineCard } from "../define.js";

export default defineCard({
  name: "Make Disappear",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  casualty: 1,
  text:
    "Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this spell and you may choose a new target for the copy.)\n" +
    "Counter target spell unless its controller pays {2}.",
  targets: ["spell"],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
});
