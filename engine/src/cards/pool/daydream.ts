import { defineCard } from "../define.js";

// Spaceshift's flicker with Acrobatic Maneuver's target: the creature returns
// as a new object (rule 400.7), the counter on it as it enters.
export default defineCard({
  name: "Daydream",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{2}{W}" },
  text:
    "Exile target creature you control, then return that card to the battlefield under its owner's control with a +1/+1 counter on it.\n" +
    "Flashback {2}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature-you-control"],
  effect: { kind: "flicker", target: 0, thenCounters: { kind: "+1/+1", amount: 1, entering: true } },
});
