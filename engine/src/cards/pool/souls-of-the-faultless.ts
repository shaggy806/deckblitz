import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 17274.
//
// Wall of Essence's combat-damage trigger, plus the life loss. Combat damage
// is dealt only in a combat damage step, where the trigger also resolves, and
// the attacking player is the active player (rule 506.2) — so it's you when it
// somehow attacks itself (the second ruling).
//
// Rulings:
//   [2006-02-01] If Souls of the Faultless is dealt combat damage in a Two-Headed Giant game, you
//     may choose either member of the attacking team as the player who will lose life.
//   [2006-02-01] If Souls of the Faultless somehow attacks and is dealt combat damage, you will
//     both gain and lose life when its ability resolves.

const TEXT =
  "Whenever this creature is dealt combat damage, you gain that much life and attacking player loses that much life.";

export default defineCard({
  name: "Souls of the Faultless",
  manaCost: "{W}{B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self", combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { triggerValue: true } },
          { kind: "lose-life", amount: { triggerValue: true }, who: "active-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
