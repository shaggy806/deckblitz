import { defineCard } from "../define.js";

// "A Blood token" is any artifact token with the subtype Blood, sacrificed
// for any reason (the rulings). "One or more … only once each turn": the
// first sacrifice of the turn triggers it and no other does.
const TRIGGER_TEXT =
  "Whenever you sacrifice one or more Blood tokens, target creature can't block this turn. This ability triggers only once each turn.";

export default defineCard({
  name: "Blood Hypnotist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: `This creature can't block.\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Blood", token: true } },
      oncePerTurn: true,
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
