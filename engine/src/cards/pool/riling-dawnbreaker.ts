import { defineCard } from "../define.js";

// EDHREC rank 14556.
//
// Rulings:
//   [2025-04-04] If a spell is cast as an Omen, its controller shuffles it into its owner's
//     library instead of putting it into its owner's graveyard as it resolves.
//   [2025-04-04] An omen card is a creature card in every zone except the stack, as well as while
//     on the stack if not cast as an Omen. Ignore its alternative characteristics in those cases.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, another target creature you control gets +1/+0 until end of turn.";

export default defineCard({
  name: "Riling Dawnbreaker",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  faces: ["Riling Dawnbreaker", "Signaling Roar"],
  omen: true,
});
