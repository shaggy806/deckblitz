import { defineCard } from "../define.js";

// EDHREC rank 16944. Devoid: no colors. No More Lies' shape with {4}.

export default defineCard({
  name: "Spell Shrivel",
  manaCost: "{2}{U}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nCounter target spell unless its controller pays {4}. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{4}", text: "Pay {4}." }],
    otherwise: { kind: "counter", target: 0, into: "exile" },
  },
});
