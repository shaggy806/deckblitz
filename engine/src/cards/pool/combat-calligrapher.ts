import { defineCard } from "../define.js";

// The Inkling is created by the attacking player (the active player — only
// they declare attackers), tapped and attacking the opponent who was
// attacked. It was never declared as an attacker (rule 508.4), so the
// "can't attack" clause doesn't stop it.

const RESTRICT_TEXT = "Inklings can't attack you or planeswalkers you control.";
const TRIGGER_TEXT =
  "Whenever a player attacks one of your opponents, that attacking player creates a tapped 2/1 white and black Inkling creature token with flying that's attacking that opponent.";

export default defineCard({
  name: "Combat Calligrapher",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${RESTRICT_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Inkling" } },
      cantAttackController: true,
      text: RESTRICT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "opponent" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Inkling Token",
        count: 1,
        who: "active-player",
        tapped: true,
        attacking: { player: "trigger-player" },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
