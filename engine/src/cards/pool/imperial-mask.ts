import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 27193.
//
// The engine plays free-for-all tables only, where no player has a teammate
// (Stump Stomp's note): the enters trigger still triggers (when the Mask isn't
// a token) and resolves, and "each of your teammates" is nobody — an empty
// effect is exactly what it does there.
//
// Rulings:
//   Only teammates within the range of influence of Imperial Mask's controller will get a token.
//     Imperial Mask's controller doesn't get a token; that player just gets the Imperial Mask.

const ENTER_TEXT =
  "When this enchantment enters, if it's not a token, each of your teammates creates a token that's a copy of this enchantment.";
const HEXPROOF_TEXT = "You have hexproof. (You can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Imperial Mask",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${HEXPROOF_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { token: false } },
      targets: [],
      effect: { kind: "sequence", effects: [] },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, playerHexproof: true, text: HEXPROOF_TEXT }],
});
