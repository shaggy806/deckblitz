import { defineCard } from "../define.js";

// EDHREC rank 8059.
//
// Rulings:
//   [2004-12-01] If another player has gained control of Screams from Within, its triggered
//     ability does nothing when it's put into a graveyard. Cards are always put into their owner's
//     graveyard, but Screams from Within's ability looks for the card only in its controller's
//     graveyard.
//   [2005-08-01] If Screams from Within returns to the battlefield from your graveyard, you choose
//     the creature that Screams from Within enchants (just as you would for any Aura that you're
//     putting onto the battlefield without casting it). If there's nothing at all that Screams
//     from Within can enchant, it remains in your graveyard.
// The Aura is in the graveyard (a state-based action) before the trigger goes on
// the stack, so "this card" is that graveyard card. It returns only from its
// controller's graveyard — one the ability's controller owns, still there —
// and an Aura put onto the battlefield asks what it enchants (rule 303.4f).

const PUMP_TEXT = "Enchanted creature gets -1/-1.";
const RETURN_TEXT = "When enchanted creature dies, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Screams from Within",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-1, -1],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-zone", zones: ["graveyard"] },
            { kind: "source", filter: { ownedBy: "you" } },
          ],
        },
        then: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
