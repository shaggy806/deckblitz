import { defineCard } from "../define.js";

// The kicker is announced before the targets and the division (rule 601.2b
// before 601.2d), so the total — 3, or 6 kicked — is read as it's cast, at
// least 1 to each target: no more targets than the total. Each share is a
// shield on its target for the turn (615.7). A copy of a kicked spell is
// kicked, and keeps its division (707.10).
export default defineCard({
  name: "Pollen Remedy",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker—Sacrifice a land. (You may sacrifice a land in addition to any other costs as you cast this spell.)\nPrevent the next 3 damage that would be dealt this turn to any number of targets, divided as you choose. If this spell was kicked, prevent the next 6 damage this way instead.",
  targets: [{ kind: "any-number", of: "any-target" }],
  divided: { total: { ifCondition: { kind: "self-kicked" }, then: 6, else: 3 }, slot: 0, of: "damage to prevent" },
  effect: { kind: "prevent-damage-divided", from: 0 },
  kicker: {
    cost: "",
    also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } },
  },
});
