import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 18148.
//
// Rulings:
//   [2021-06-18] The basic land types are Plains, Island, Swamp, Mountain, and Forest. Land types
//     other than basic land types (such as Desert) don't contribute to domain abilities.
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.
//
// Esper Sentinel's `payGeneric`, the domain count read as the spell resolves.

export default defineCard({
  name: "Evasive Action",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Domain — Counter target spell unless its controller pays {1} for each basic land type among lands you control.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { basicLandTypes: "you" }, text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
