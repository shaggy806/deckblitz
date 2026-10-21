import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 27263.
//
// Rulings:
//   [2004-10-04] You both sacrifice it and deal the 5 damage at end of combat.
//   [2005-08-01] A "permanent that isn't enchanted" is a permanent with no Auras on it.
//   [2007-09-16] If Time Elemental attacks or blocks, but you no longer control it at end of
//     combat, you can't sacrifice it. However, it will still deal 5 damage to you.
//
// One trigger per event (Dorothea, Vengeful Victim's shape), each setting up
// a delayed trigger at end of combat. `sacrifice-target` sacrifices it only
// while its controller (you) still controls it; the damage is dealt either
// way, to the delayed trigger's controller.
const COMBAT_TEXT = "When this creature attacks or blocks, at end of combat, sacrifice it and it deals 5 damage to you.";
const BOUNCE_TEXT = "{2}{U}{U}, {T}: Return target permanent that isn't enchanted to its owner's hand.";

const atEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "sacrifice-target", target: "source" },
        { kind: "damage", amount: 5, who: "you" },
      ],
    },
    text: "Sacrifice Time Elemental and it deals 5 damage to you.",
  },
  resolve: null,
  text: COMBAT_TEXT,
});

export default defineCard({
  name: "Time Elemental",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 2,
  text: `${COMBAT_TEXT}\n${BOUNCE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { enchanted: false } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
  triggered: [atEndOfCombat("attacks"), atEndOfCombat("blocks")],
});
