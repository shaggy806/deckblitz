import { defineCard } from "../define.js";

export default defineCard({
  name: "Walk the Aeons",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Buyback—Sacrifice three Islands. (You may sacrifice three Islands in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget player takes an extra turn after this one.",
  kicker: { cost: "", keyword: "buyback", also: { text: "Sacrifice three Islands", sacrifice: { filter: { subtype: "Island" }, count: 3 } } },
  targets: ["player"],
  effect: { kind: "take-extra-turn", target: 0 },
});
