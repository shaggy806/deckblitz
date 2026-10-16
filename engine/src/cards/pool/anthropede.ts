import { defineCard } from "../define.js";

// EDHREC rank 25890. General Traag, Heart of Stone's shape with a choice of
// two costs (Tergrid's Lantern's discard beside Divert Disaster's {2}): either
// one paid sets off the reflexive trigger, whose target Room is chosen only
// then.
//
// Rulings:
//   You don't choose a target for Anthropede's last ability at the time it triggers. Rather, a
//     second "reflexive" ability triggers when you discard a card or pay {2} this way. You choose
//     a target for that ability as it goes on the stack. Each player may respond to this
//     triggered ability as normal.
const ENTER_TEXT = "When this creature enters, you may discard a card or pay {2}. When you do, destroy target Room.";

export default defineCard({
  name: "Anthropede",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { discard: 1, text: "Discard a card" },
          { pay: "{2}", text: "Pay {2}" },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", filter: { subtype: "Room" } }],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target Room.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
