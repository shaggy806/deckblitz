import { defineCard } from "../define.js";

// Rule 205.1a: "become … Bird creatures" replaces their card types, so a
// planeswalker subtype and the planeswalker's loyalty rules go while this lasts.
// A loyalty ability is still activated as one (rule 606.3), its counters kept.
const TEXT =
  'At the beginning of combat on your turn, choose any number of target planeswalkers you control. Until end of turn, they become 3/3 blue Bird creatures with flying, hexproof, and "Whenever this creature deals combat damage to a player, scry 1." (They\'re no longer planeswalkers. Loyalty abilities can still be activated.)';

export default defineCard({
  name: "Sparkshaper Visionary",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { type: "planeswalker" } } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "become",
              target: 0,
              power: 3,
              toughness: 3,
              setTypes: ["creature"],
              setSubtypes: ["Bird"],
              setColors: ["U"],
              keywords: ["flying", "hexproof"],
              duration: "end-of-turn",
            },
            {
              kind: "grant-triggered",
              target: 0,
              ability: {
                trigger: { on: "deals-combat-damage-to-player", who: "self" },
                targets: [],
                effect: { kind: "scry", amount: 1 },
                resolve: null,
                text: "Whenever this creature deals combat damage to a player, scry 1.",
              },
              duration: "end-of-turn",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
