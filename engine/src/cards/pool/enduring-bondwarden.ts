import { defineCard } from "../define.js";
import { backup } from "../helpers.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 18391.
//
// "Its counters" are every kind the dying creature had as it last existed on
// the battlefield, -1/-1 counters too, put (not moved) onto the target
// (`put-counters-of` — Essence Channeler's shape; the rulings). Backup grants
// the same trigger to another creature until end of turn, where "this
// creature" is that creature.
//
// Rulings:
//   [2023-04-14] Enduring Bondwarden's last ability puts counters that were on the creature with
//     the ability onto the target creature, not just its +1/+1 counters.
//   [2023-04-14] Enduring Bondwarden's last ability doesn't cause you to move counters from the
//     creature with the ability onto the target creature. Rather, you put the same number of each
//     kind of counter the first creature had when it died onto the target creature.
//   [2023-04-14] If the creature with Enduring Bondwarden's last ability has -1/-1 counters on it
//     when it dies, that ability will include those as well. This may result in the recipient also
//     dying.

const DIES_TEXT = "When this creature dies, put its counters on target creature you control.";

const DIES: TriggeredAbility = {
  trigger: { on: "dies", who: "self" },
  targets: ["creature-you-control"],
  effect: { kind: "put-counters-of", of: "source", target: 0 },
  resolve: null,
  text: DIES_TEXT,
};

export default defineCard({
  name: "Enduring Bondwarden",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 0,
  toughness: 1,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${DIES_TEXT}`,
  triggered: [backup(1, { triggered: [DIES] }), DIES],
});
