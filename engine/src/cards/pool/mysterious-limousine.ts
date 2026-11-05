import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 14309.
//
// The creature is exiled until this Vehicle leaves (rule 610.3) and linked to
// it (rule 607.2a), so "each other card exiled with this Vehicle" reaches the
// ones an earlier trigger exiled, not the one just exiled (`others` —
// Mirror of Life Trapping). Nothing returns unless a creature was exiled.
const TEXT =
  "Whenever this Vehicle enters or attacks, exile up to one other target creature until this Vehicle leaves the battlefield. If a creature is put into exile this way, return each other card exiled with this Vehicle to the battlefield under its owner's control.";

const trigger = (on: "enters-battlefield" | "attacks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0, untilSourceLeaves: true, linked: true },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
        then: { kind: "return-exiled-by-source", linked: "battlefield", others: true },
      },
    ],
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Mysterious Limousine",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${TEXT}\n${crewText(2)}`,
  triggered: [trigger("enters-battlefield"), trigger("attacks")],
  activated: [crew(2, crewText(2))],
});
