import { defineCard } from "../define.js";

// One redirection shield of 2 over you and your permanents, from a source
// chosen as it resolves (rule 609.7). The damage is redirected, dealt to the
// target by the chosen source (614.9). When that source's damage to several of
// them at once is more than the shield has left, you choose which of it is
// redirected (rule 615.7 — `Game`'s `shieldSharesAsked`).
export default defineCard({
  name: "Harm's Way",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The next 2 damage that a source of your choice would deal to you and/or permanents you control this turn is dealt to any target instead.",
  targets: ["any-target"],
  effect: { kind: "prevent-damage-from-chosen-source", to: "your-side", amount: 2, redirectTo: 0 },
});
