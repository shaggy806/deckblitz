import { defineCard } from "../define.js";

// EDHREC rank 15813.
//
// Devoid: no colour. The Scion comes whether or not the {1} is paid (the
// ruling).
export default defineCard({
  name: "Abstruse Interference",
  manaCost: "{2}{U}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nCounter target spell unless its controller pays {1}. You create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\" ({C} represents colorless mana.)",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
    ],
  },
});
