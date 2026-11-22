import { defineCard } from "../define.js";

// Acolyte's Reward's shape over "you and/or permanents you control": one
// shield of X over all of them (rule 615.7 — when it can't cover all the damage
// of one event, its player chooses which damage it prevents, `Game`'s
// `shieldSharesAsked`). It isn't a redirection: Divine Deflection itself deals
// the damage it prevented to the target, once for all of one event (615.5).
export default defineCard({
  name: "Divine Deflection",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next X damage that would be dealt to you and/or permanents you control this turn. If damage is prevented this way, Divine Deflection deals that much damage to any target.",
  targets: ["any-target"],
  effect: {
    kind: "damage-rule",
    to: { players: "you", permanents: { controlledBy: "you" } },
    amount: "x",
    then: { kind: "damage", amount: "x", target: 0 },
  },
});
