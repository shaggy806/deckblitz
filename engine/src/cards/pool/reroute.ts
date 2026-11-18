import { defineCard } from "../define.js";

// EDHREC rank 16508.
//
// An activated ability with exactly one target chosen as it went on the
// stack (rule 115.9a); its target must change to another legal one if one
// can be (rule 115.7a). A mana ability never is one (605.3b). The card is
// drawn either way.

export default defineCard({
  name: "Reroute",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Change the target of target activated ability with a single target. (Mana abilities can't be targeted.)\nDraw a card.",
  targets: [{ kind: "ability", abilityKind: "activated", singleTarget: true }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "change-targets", target: 0, how: "change" },
      { kind: "draw", amount: 1 },
    ],
  },
});
