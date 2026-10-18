import { defineCard } from "../define.js";

// EDHREC rank 10868.
//
// Rulings:
//   [2023-04-14] If the copied artifact is copying something else, then the token enters the
//     battlefield as whatever that artifact copied.
//   [2023-04-14] If the copied artifact is a token, the token that's created copies the original
//     characteristics of that token as stated by the effect that created that token.
//   [2023-04-14] Any enters-the-battlefield abilities of the copied artifact will trigger when the
//     token enters the battlefield. Any "as [this artifact] enters the battlefield" or "[this
//     artifact] enters the battlefield with" abilities of the copied artifact will also work.
//   [2023-04-14] Each of the tokens copy exactly what was printed on the original artifact and
//     nothing else. It doesn't copy whether that artifact is tapped or untapped, whether it has
//     any counters on it or Auras and Equipment attached to it, or any non-copy effects.
//   [2023-04-14] If the copied artifact has {X} in its mana cost, X is 0.
//
// "That player" is the damaged player (`whose: "trigger-player"`, Scion of
// Calamity); the token is yours (Donatello's `who: "you"`).

const TEXT =
  "Whenever this creature deals combat damage to a player, create a token that's a copy of target artifact that player controls.";

export default defineCard({
  name: "Schema Thief",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue", "Artificer"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "artifact" } }],
      effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
