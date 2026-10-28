import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { affinity, crew, crewText } from "../helpers.js";

// EDHREC rank 4233.
//
// Affinity for artifacts is a live self cost reduction (Ethersworn Sphinx's).
// "For each player, destroy up to one target creature that player controls"
// is one optional slot per seat, 0 (you) to 3 (Age of Ultron's shape, with
// seat 0 added), destroyed as one instruction. "A creature you controlled was
// destroyed this way" reads the destroyed creatures as they last were on the
// battlefield (`this-way` `who: "you"` — Break the Spell's).

const ENTER_TEXT =
  "When this Vehicle enters, for each player, destroy up to one target creature that player controls. If a creature you controlled was destroyed this way, put two +1/+1 counters on this Vehicle.";

const perPlayer = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Demonic Junker",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\n${ENTER_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perPlayer(0), perPlayer(1), perPlayer(2), perPlayer(3)],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "destroy", target: 0 },
              { kind: "destroy", target: 1 },
              { kind: "destroy", target: 2 },
              { kind: "destroy", target: 3 },
            ],
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "destroyed", who: "you", filter: { type: "creature" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
