import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 26192.
//
// Rulings:
//   [2004-10-04] You can choose the same creature more than once (for no additional effect).
//   [2004-10-04] It can end up holding more than one creature tapped.
// "That player" is the player dealt damage (Sigil of Sleep's target shape);
// "for as long as this creature remains on the battlefield" is `"while-source"`.

const TEXT =
  "Whenever this creature deals damage to a player, tap target creature that player controls. That creature doesn't untap during its controller's untap step for as long as this creature remains on the battlefield.";

export default defineCard({
  name: "Somnophore",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
