import { defineCard } from "../define.js";

// EDHREC rank 9807.
//
// Rulings:
//   [2021-09-24] If a nonmodal double-faced card has somehow become a copy of Enduring Angel, the
//     replacement effect will apply, the copy of Enduring Angel will transform, and your life
//     total will become 3. However, because the copy effect that makes it Enduring Angel continues
//     to apply to it after it transforms, it will still be a copy of Enduiring Angel. This means
//     that the replacement effect will be applied again if your life total would be reduced to 0
//     or less a second time while that copy effect is still applied.
//   [2021-09-24] Applying the replacement effect can't cause Enduring Angel to transform if it
//     isn't a double-faced permanent; that is, if it's a token or if a single-faced permanent has
//     become a copy of it. In that situation, you will lose the game.
//   [2021-09-24] Enduring Angel's last ability is a replacement effect. It doesn't use the stack
//     and can't be responded to. Notably, players cannot try to destroy Enduring Angel to prevent
//     it from transforming and cause you to lose the game.
//
// The last ability is a `would-lose-life` replacement with `toZeroOrLess`:
// every loss (damage, an effect, a cost, a set or exchanged total) that
// would leave the life total at 0 or less is replaced whole (rule 614.6).
// The life total becoming 3 is a gain or a loss of the difference (rule
// 119.5). A token or a single-faced copy doesn't transform, and its player
// loses (`otherwise`).

const HEXPROOF_TEXT = "You have hexproof.";
const REPLACEMENT_TEXT =
  "If your life total would be reduced to 0 or less, instead transform this creature and your life total becomes 3. " +
  "Then if this creature didn't transform this way, you lose the game.";
const LIFE_BECOMES_3 = { kind: "set-life-total", who: "you", amount: 3 } as const;

export default defineCard({
  name: "Enduring Angel",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "double-strike"],
  text: `Flying, double strike\n${HEXPROOF_TEXT}\n${REPLACEMENT_TEXT}`,
  static: [
    { affects: { scope: "self" }, playerKeywords: ["hexproof"], text: HEXPROOF_TEXT },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-lose-life",
        who: "you",
        toZeroOrLess: true,
        instead: {
          effect: {
            kind: "transform",
            target: "source",
            then: LIFE_BECOMES_3,
            otherwise: { kind: "sequence", effects: [LIFE_BECOMES_3, { kind: "lose-game", who: "you" }] },
          },
        },
      },
      text: REPLACEMENT_TEXT,
    },
  ],
  faces: ["Enduring Angel", "Angelic Enforcer"],
  transform: true,
});
