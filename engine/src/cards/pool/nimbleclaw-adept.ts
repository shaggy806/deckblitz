import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 9118.
// Ioreth of the Healing House's "two other target" slots: two different
// permanents, neither of them this creature.

const TEXT =
  "Bigby's Hand — {T}: Untap two other target permanents. Activate only as a sorcery and only once each turn.";

export default defineCard({
  name: "Nimbleclaw Adept",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: distinctTargets(2, { kind: "other", of: "permanent" }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
      oncePerTurn: true,
    },
  ],
});
