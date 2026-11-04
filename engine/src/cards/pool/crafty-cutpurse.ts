import { defineCard } from "../define.js";

// Rulings:
//   A token that would be created tapped and attacking, under a player who isn't attacking, is
//   created tapped but not attacking.
//   With one of these on each side of a duel a token enters under the player who would have
//   created it: each effect applies once.
//   It applies before any other replacement effect on the token: an opponent's Anointed Procession
//   doesn't double it. It doesn't change who controls a delayed trigger from the effect (Kiki-Jiki's
//   controller can't sacrifice the token).
const TEXT =
  "When this creature enters, each token that would be created under an opponent's control this turn is created under your control instead.";

export default defineCard({
  name: "Crafty Cutpurse",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", tokensComeToOwner: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
