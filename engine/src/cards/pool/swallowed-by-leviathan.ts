import { defineCard } from "../define.js";

// EDHREC rank 8723.
//
// "Choose target spell" is its one target. The surveil happens first, so the
// cards it puts into your graveyard count toward the {1} each that the
// spell's controller is asked for — read as the `unless` applies.

const TEXT =
  "Choose target spell. Surveil 2, then counter the chosen spell unless its controller pays {1} for each card in your graveyard.";

export default defineCard({
  name: "Swallowed by Leviathan",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${TEXT} (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 2 },
      {
        kind: "unless",
        chooser: 0,
        options: [{ payGeneric: { graveyardSize: "you" }, text: "Pay {X}." }],
        otherwise: { kind: "counter", target: 0 },
      },
    ],
  },
});
