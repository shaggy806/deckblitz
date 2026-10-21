import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const GRANTED_TEXT =
  "Whenever this creature deals combat damage to a player or planeswalker, destroy target artifact or enchantment defending player controls.";

/** "…to a player or planeswalker": one damage event has one recipient, so a
 * trigger per kind of recipient fires exactly once per hit (Hunter's
 * Insight's shape). Defending player is the attacked planeswalker's
 * controller when it attacks one (the ruling). */
const destroyOn = (to: "player" | "planeswalker"): TriggeredAbility => ({
  trigger: { on: "deals-damage", who: "self", combat: true, to },
  targets: [{ kind: "permanent", whose: "defending-player", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
  effect: { kind: "destroy", target: 0 },
  resolve: null,
  text: GRANTED_TEXT,
});

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Storm the Citadel",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Until end of turn, creatures you control get +2/+2 and gain "${GRANTED_TEXT}"`,
  targets: [],
  // Only the creatures you control as it resolves (the ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: YOURS, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-triggered-all", filter: YOURS, ability: destroyOn("player"), duration: "end-of-turn" },
      { kind: "grant-triggered-all", filter: YOURS, ability: destroyOn("planeswalker"), duration: "end-of-turn" },
    ],
  },
});
