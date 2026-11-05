import { defineCard } from "../define.js";

export default defineCard({
  name: "Silumgar's Scorn",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "reveal",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
    orControls: { subtype: "Dragon" },
    effect: { kind: "counter", target: 0 },
  },
  text: "As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\nCounter target spell unless its controller pays {1}. If you revealed a Dragon card or controlled a Dragon as you cast this spell, counter that spell instead.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{1}", text: "Pay {1}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
