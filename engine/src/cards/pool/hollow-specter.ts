import { defineCard } from "../define.js";

// The {X} is announced as the may's cost is paid (Stark's Ingenuity's
// shape); the damaged player picks which X cards to reveal (Blackmail's
// `reveals`), and the controller chooses one of them to discard.
const HIT =
  "Whenever this creature deals combat damage to a player, you may pay {X}. If you do, that player reveals X cards from their hand and you choose one of them. That player discards that card.";

export default defineCard({
  name: "Hollow Specter",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${HIT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to have that player reveal X cards from their hand, one of which you choose for them to discard?",
        cost: "{X}",
        effect: { kind: "discard-chosen", target: "trigger-player", reveals: "x" },
      },
      resolve: null,
      text: HIT,
    },
  ],
});
