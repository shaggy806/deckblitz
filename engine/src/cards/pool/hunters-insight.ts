import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever that creature deals combat damage to a player or planeswalker this turn, draw that many cards.";

/** "…to a player or planeswalker": one damage event has one recipient, so a
 * trigger per kind of recipient fires exactly once per hit, for that hit's
 * amount (The Reaver Cleaver's shape). */
const drawFor = (to: "player" | "planeswalker"): TriggeredAbility => ({
  trigger: { on: "deals-damage", who: "self", combat: true, to },
  targets: [],
  effect: { kind: "draw", amount: { triggerValue: true } },
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "Hunter's Insight",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target creature you control. Whenever that creature deals combat damage to a player or planeswalker this turn, draw that many cards.",
  targets: ["creature-you-control"],
  // The printed card grants nothing visible, but "whenever that creature …
  // this turn" is the same shape as Hunter's Prowess's granted ability.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-triggered", target: 0, duration: "end-of-turn", ability: drawFor("player") },
      { kind: "grant-triggered", target: 0, duration: "end-of-turn", ability: drawFor("planeswalker") },
    ],
  },
});
