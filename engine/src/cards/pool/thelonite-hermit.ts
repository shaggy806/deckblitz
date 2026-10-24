import { defineCard } from "../define.js";

// EDHREC rank 7857.
//
// Rulings:
//   Because damage remains marked on a creature until the damage is removed as the turn ends,
//     nonlethal damage dealt to a Saproling may become lethal if Thelonite Hermit leaves the
//     battlefield during that turn.
//
// "All Saprolings" is every Saproling on the battlefield, whoever controls it.

const UP_TEXT = "When this creature is turned face up, create four 1/1 green Saproling creature tokens.";

export default defineCard({
  name: "Thelonite Hermit",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{3}{G}{G}" },
  text: `All Saprolings get +1/+1.\nMorph {3}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${UP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Saproling" } },
      grantPt: [1, 1],
      text: "All Saprolings get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 4 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
