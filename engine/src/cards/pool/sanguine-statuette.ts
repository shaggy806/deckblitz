import { defineCard } from "../define.js";

// "Become a 3/3 Vampire artifact creature with haste" keeps it an artifact
// and sets its base P/T in layer 7b with a new timestamp each time — so a
// later sacrifice resets another setting effect to 3/3, while modifications
// (-2/-2, counters) still apply on top (the rulings).
const ENTERS_TEXT = "When this artifact enters, create a Blood token.";
const ANIMATE_TEXT =
  "Whenever you sacrifice a Blood token, you may have this artifact become a 3/3 Vampire artifact creature with haste until end of turn.";

export default defineCard({
  name: "Sanguine Statuette",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text:
    "When this artifact enters, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")\n" +
    ANIMATE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Blood", token: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Sanguine Statuette become a 3/3 Vampire artifact creature with haste until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: 3,
          toughness: 3,
          addTypes: ["creature"],
          addSubtypes: ["Vampire"],
          keywords: ["haste"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
