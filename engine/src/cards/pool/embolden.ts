import { defineCard } from "../define.js";

// The 4 is divided as it's cast, at least 1 to each target (rule 601.2d);
// each share is a shield on its target for the turn (615.7).
const TEXT = "Prevent the next 4 damage that would be dealt this turn to any number of targets, divided as you choose.";

export default defineCard({
  name: "Embolden",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${TEXT}\nFlashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  flashback: { cost: "{1}{W}" },
  targets: [{ kind: "any-number", of: "any-target", max: 4 }],
  divided: { total: 4, slot: 0, of: "damage to prevent" },
  effect: { kind: "prevent-damage-divided", from: 0 },
});
