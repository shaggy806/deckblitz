import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 24607.
//
// Two exchanges, one after the other (the third ruling: an artifact creature
// may be in both). For each, you choose your permanent of that type with the
// greatest mana value, then the target player chooses theirs — a choice as
// it resolves, not a target, so shroud and hexproof don't stop it (the first
// ruling) — and the two change hands as one exchange (rule 701.12b). If
// either player has none, that exchange does nothing and the next still
// happens (701.12a, the second ruling). The nested `keepTargets` puts the
// second choice at slot 0, the first at 1 and the target player at 2.

const exchangeGreatest = (type: "creature" | "artifact"): EffectSpec => ({
  kind: "choose-permanents",
  filter: {
    type,
    controlledBy: "you",
    greatestAmongItsController: { of: "mana-value", among: { type } },
  },
  min: 1,
  upTo: 1,
  keepTargets: true,
  prompt: `Choose the ${type} you control with the greatest mana value`,
  then: {
    kind: "choose-permanents",
    chooser: 1,
    filter: {
      type,
      controlledBy: "you",
      greatestAmongItsController: { of: "mana-value", among: { type } },
    },
    min: 1,
    upTo: 1,
    keepTargets: true,
    prompt: `Choose the ${type} you control with the greatest mana value`,
    then: { kind: "exchange-control", objects: [1, 0] },
  },
});

export default defineCard({
  name: "Juxtapose",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You and target player exchange control of the creature you each control with the greatest mana value. Then exchange control of artifacts the same way. If two or more permanents a player controls are tied for greatest, their controller chooses one of them.",
  targets: ["player"],
  effect: { kind: "sequence", effects: [exchangeGreatest("creature"), exchangeGreatest("artifact")] },
});
