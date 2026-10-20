import { defineCard } from "../define.js";

// EDHREC rank 10480. Pain 101's grant, then the life gain.
const RETURN_TEXT =
  "When this creature dies, return it to the battlefield tapped under its owner's control.";

export default defineCard({
  name: "Infuse with Vitality",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: `Until end of turn, target creature gains deathtouch and "${RETURN_TEXT}"\nYou gain 2 life.`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
          resolve: null,
          text: RETURN_TEXT,
        },
      },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
