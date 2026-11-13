import { defineCard } from "../define.js";

// EDHREC rank 4225. The first ability is the initiative's batch (rule 726.2):
// once for a combat damage step in which any creature an opponent controls
// dealt you combat damage; only an attacking creature deals a player combat
// damage, so "that opponent" is the active player (rules 506.2, 510.1). The
// second triggers once for the whole declaration (`attack-with`, any player),
// and its "players being attacked" are those attackers were declared at —
// the player, not one whose planeswalker is attacked — checked as it triggers
// and again as it resolves (rule 603.4).
//
// Rulings:
//   - A player is poisoned if that player has one or more poison counters.

const POISON_TEXT =
  "Whenever one or more creatures an opponent controls deal combat damage to you, that opponent gets a poison counter.";
const ATTACK_TEXT =
  "Whenever a player attacks, if one or more players being attacked are poisoned, the attacking player draws a card.";

export default defineCard({
  name: "Norn's Decree",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${POISON_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "any",
        filter: { type: "creature", controlledBy: "opponent" },
        to: "you",
        combat: true,
      },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "active-player" },
      resolve: null,
      text: POISON_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "any", atLeast: 1 },
      condition: { kind: "amounts", left: { playerCounters: "poison", who: "players-being-attacked" }, op: "gte", right: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "active-player" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
