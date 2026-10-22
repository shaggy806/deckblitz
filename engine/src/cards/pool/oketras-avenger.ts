import { defineCard } from "../define.js";

// Exert as it attacks (Glorybringer's shape); the reflexive "when you do"
// puts an "all" combat-damage prevention shield on it for the turn.
const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, prevent all combat damage that would be dealt to it this turn. (An exerted creature won't untap during your next untap step.)";

export default defineCard({
  name: "Oketra's Avenger",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: EXERT_TEXT,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: "all", combatOnly: true },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
