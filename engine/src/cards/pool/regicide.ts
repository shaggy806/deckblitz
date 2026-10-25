import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 31702.
//
// No game on this engine is drafted, so no colours were chosen for it: its target must be
// one or more of no colours, which no creature is — `anyOf` over the empty list. Its
// ruling: with no Regicide drafted, it can't be cast, having no legal target.
export default defineCard({
  name: "Regicide",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Reveal this card as you draft it. The player to your right chooses a color, you choose another color, then the player to your left chooses a third color.\nDestroy target creature that's one or more of the colors chosen as you drafted cards named Regicide.",
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [] } }],
  effect: { kind: "destroy", target: 0 },
});
