import { defineCard } from "../define.js";

// One combat damage event makes you the monarch once, however many creatures
// connect and however many players they hit (`once: "per-event"`).
const WATCH_TEXT =
  "Whenever one or more creatures you control deal combat damage to one or more players this turn, you become the monarch.";

export default defineCard({
  name: "Forth Eorlingas!",
  manaCost: "{X}{R}{W}",
  colors: ["R", "W"],
  types: ["sorcery"],
  text: `Create X 2/2 red Human Knight creature tokens with trample and haste.\n${WATCH_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Human Knight Token", count: "x" },
      {
        kind: "delayed-trigger",
        at: {
          whenever: {
            on: "deals-damage-batch",
            who: "you-control",
            filter: { type: "creature" },
            to: "player",
            combat: true,
            once: "per-event",
          },
        },
        effect: { kind: "become-monarch" },
        text: WATCH_TEXT,
      },
    ],
  },
});
