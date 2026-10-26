import { defineCard } from "../define.js";

export default defineCard({
  name: "Forbid",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Buyback—Discard two cards. (You may discard two cards in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nCounter target spell.",
  targets: ["spell"],
  kicker: { cost: "", keyword: "buyback", also: { text: "Discard two cards", discard: 2 } },
  effect: { kind: "counter", target: 0 },
});
