import { defineCard } from "../define.js";

// EDHREC rank 13241.
//
// Rulings:
//   [2025-11-14] You don't choose a target for Leatherhead's last ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you remove a counter from Leatherhead
//     this way.
//
// The counter removed is one of the controller's choice of kind
// (`remove-counters`, `counter: "any"`); "when you do" triggers only if one
// came off (Kappa Tech-Wrecker's reflexive trigger, its target controlled by
// the player she damaged).
const ENTER_TEXT = "Leatherhead enters with a hexproof counter on her.";
const DAMAGE_TEXT =
  "Whenever Leatherhead deals combat damage to a player, you may remove a counter from her. When you do, destroy target artifact or enchantment that player controls.";

export default defineCard({
  name: "Leatherhead, Swamp Stalker",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Crocodile", "Mutant", "Rogue"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "hexproof", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a counter from Leatherhead?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-counters", target: "source", counter: "any", count: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "counters-removed" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  { kind: "permanent", whose: "trigger-player", filter: { typesAnyOf: ["artifact", "enchantment"] } },
                ],
                effect: { kind: "destroy", target: 0 },
                text: "When you do, destroy target artifact or enchantment that player controls.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
