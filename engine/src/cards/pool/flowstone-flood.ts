import { defineCard } from "../define.js";

export default defineCard({
  name: "Flowstone Flood",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "buyback", also: { text: "Pay 3 life, Discard a card at random", payLife: 3, discard: 1, discardAtRandom: true } },
  text: "Buyback—Pay 3 life, Discard a card at random. (You may pay 3 life and discard a card at random in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nDestroy target land.",
  targets: ["land"],
  effect: { kind: "destroy", target: 0 },
});
