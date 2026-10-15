import { defineCard } from "../define.js";

// EDHREC rank 16451.
//
// Combustible Gearhulk's shape: the target opponent picks one of two
// outcomes, each of them this creature's controller's effect — the Landers
// are yours, the counters go on this creature (none if it has left).

const ENTER_TEXT =
  "When this creature enters, target opponent may have you create two Lander tokens. If they don't, put two +1/+1 counters on this creature.";
const TEXT = `${ENTER_TEXT} (A Lander token is an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")`;

export default defineCard({
  name: "Terrapact Intimidator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Scout"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          {
            text: "Have them create two Lander tokens.",
            effect: { kind: "create-token", token: "Lander Token", count: 2 },
          },
          {
            text: "Don't — they put two +1/+1 counters on this creature.",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
