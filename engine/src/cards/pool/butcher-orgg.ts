import { defineCard } from "../define.js";

// EDHREC rank 29552. As combat damage is assigned (rule 510.1) its controller
// is asked whether to divide it, blocked or not (its ruling), and then how:
// among the defending player and every creature they control, blockers or
// not, the rest to the player. Blocked with every blocker gone, it deals no
// combat damage, so it isn't asked (its ruling).

const TEXT =
  "You may assign this creature's combat damage divided as you choose among defending player and/or any number of " +
  "creatures they control.";

export default defineCard({
  name: "Butcher Orgg",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orgg"],
  power: 6,
  toughness: 6,
  text: TEXT,
  static: [{ affects: { scope: "self" }, divideCombatDamageAmongDefender: true, text: TEXT }],
});
