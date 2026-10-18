import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// Backup 1 grants deathtouch and the damage trigger — the abilities printed
// below it (rule 702.165a) — to another creature it targets.

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player or battle, return target creature card from your graveyard to the battlefield.";

const DAMAGE: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
  resolve: null,
  text: DAMAGE_TEXT,
};

export default defineCard({
  name: "Archpriest of Shadows",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following abilities until end of turn.)\nDeathtouch\n${DAMAGE_TEXT}`,
  triggered: [backup(1, { keywords: ["deathtouch"], triggered: [DAMAGE] }), DAMAGE],
});
