import { defineCard } from "../define.js";

// Delirium is read as it resolves, and "instead" is only the upgraded effect.
// The upgrade is the `sacrifice` effect's `andEach`: a creature and a
// planeswalker, each a different permanent, so — its ruling — a lone
// creature planeswalker can't pay both parts while another creature or
// planeswalker could pay one; a part nothing can pay is skipped.
export default defineCard({
  name: "To the Slaughter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target player sacrifices a creature or planeswalker of their choice.\nDelirium — If there are four or more card types among cards in your graveyard, instead that player sacrifices a creature and a planeswalker of their choice.",
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: { kind: "delirium" },
    then: {
      kind: "sacrifice",
      who: "target",
      filter: { type: "creature" },
      count: 1,
      andEach: [{ type: "planeswalker" }],
    },
    else: { kind: "sacrifice", who: "target", filter: { typesAnyOf: ["creature", "planeswalker"] }, count: 1 },
  },
});
