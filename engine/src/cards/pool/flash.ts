import { defineCard } from "../define.js";

export default defineCard({
  name: "Flash",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    destination: "battlefield",
    leftover: "stay",
    filter: { type: "creature" },
    then: {
      kind: "unless",
      chooser: "you",
      options: [{ payManaCostOf: 0, reducedBy: 2, text: "Pay {X}" }],
      otherwise: { kind: "sacrifice-target", target: 0 },
    },
  },
  text: "You may put a creature card from your hand onto the battlefield. If you do, sacrifice it unless you pay its mana cost reduced by {2}.",
});
