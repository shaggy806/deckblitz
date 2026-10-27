import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  'At the beginning of each player\'s upkeep, that player creates a 5/1 red Elemental creature token named Lightning Rager. It has trample, haste, and "At the beginning of the end step, sacrifice this token."';

export default defineCard({
  name: "Rite of the Raging Storm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `Creatures named Lightning Rager can't attack you or planeswalkers you control.\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", name: "Lightning Rager" } },
      cantAttackController: true,
      text: "Creatures named Lightning Rager can't attack you or planeswalkers you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Lightning Rager Token", count: 1, who: "active-player" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
