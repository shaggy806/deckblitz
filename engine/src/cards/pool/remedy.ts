import { defineCard } from "../define.js";

// The 5 is divided as it's cast, at least 1 to each target (rule 601.2d);
// each share is a shield on its target for the turn (615.7).
const TEXT = "Prevent the next 5 damage that would be dealt this turn to any number of targets, divided as you choose.";

export default defineCard({
  name: "Remedy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "any-number", of: "any-target", max: 5 }],
  divided: { total: 5, slot: 0, of: "damage to prevent" },
  effect: { kind: "prevent-damage-divided", from: 0 },
});
