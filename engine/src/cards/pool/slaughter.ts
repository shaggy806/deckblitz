import { defineCard } from "../define.js";

export default defineCard({
  name: "Slaughter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: { cost: "", keyword: "buyback", also: { text: "Pay 4 life", payLife: 4 } },
  text: "Buyback—Pay 4 life. (You may pay 4 life in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nDestroy target nonblack creature. It can't be regenerated.",
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
