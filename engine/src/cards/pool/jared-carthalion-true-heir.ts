import { defineCard } from "../define.js";

// Commander Legends. EDHREC rank 14446.
//
// Rulings:
//   If the target opponent can't become the monarch (they had a Jared enter
//     earlier in the turn), the current monarch stays the monarch, even if
//     that's you.
//   If damage that can't be prevented is dealt to Jared while you're the
//     monarch, it's dealt and you still put that many +1/+1 counters on it,
//     all before the game checks for lethal damage (rule 615.12).
//
// The "can't" is on the trigger's controller as it resolves (rule 101.2 —
// nothing makes them the monarch for the rest of the turn).
const ENTER_TEXT =
  "When Jared Carthalion enters, target opponent becomes the monarch. You can't become the monarch this turn.";
const PREVENT_TEXT =
  "If damage would be dealt to Jared Carthalion while you're the monarch, prevent that damage and put that many +1/+1 counters on it.";

export default defineCard({
  name: "Jared Carthalion, True Heir",
  manaCost: "{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${PREVENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become-monarch", who: 0 },
          { kind: "prohibit", who: "you", monarch: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "monarch", who: "you" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        thenCountsUnprevented: true,
        to: "self",
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
      },
      text: PREVENT_TEXT,
    },
  ],
});
