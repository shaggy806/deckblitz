import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 12046.
// Makes Ox → "Ox Token (Ox Drover)".
//
// Rulings:
//   [2023-09-01] If the target opponent is an illegal target by the time Ox Drover's last ability
//     tries to resolve, it won't resolve. They won't create an Ox token, and you won't draw a card.

const UNBLOCKABLE_TEXT = "This creature can't be blocked by Oxen.";
const TRIGGER_TEXT =
  "Whenever this creature enters or attacks, target opponent creates a 2/4 white Ox creature token and you draw a card.";

const oxAndDraw = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Ox Token (Ox Drover)", count: 1, who: "target-controller" },
      { kind: "draw", amount: 1 },
    ],
  },
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "Ox Drover",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${UNBLOCKABLE_TEXT}\n${TRIGGER_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { subtype: "Ox" }, text: UNBLOCKABLE_TEXT }],
  triggered: [oxAndDraw({ on: "enters-battlefield", who: "self" }), oxAndDraw({ on: "attacks", who: "self" })],
});
