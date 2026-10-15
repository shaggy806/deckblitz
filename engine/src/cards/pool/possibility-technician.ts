import { defineCard } from "../define.js";

// EDHREC rank 17058.
//
// Rulings:
//   [2025-07-25] If Possibility Technician leaves the battlefield, the effect allowing you to play
//     the exiled cards if you control a Kavu continues to apply, even during later turns.
//   [2025-07-25] You pay all costs and follow all timing rules for cards played with the
//     permission granted by Possibility Technician’s first ability. For example, if an exiled card
//     is a land card, you may play it only during your main phase while the stack is empty.
//
// "This creature or another Kavu you control" is any Kavu you control
// entering, itself included (it's a Kavu — Bloomvine Regent's shape). The
// permission lasts while the card stays exiled, whatever becomes of the
// Technician (the ruling), and is usable only while you control a Kavu,
// checked live as you'd play it (`gate`).

const ENTER_TEXT =
  "Whenever this creature or another Kavu you control enters, exile the top card of your library. For as long as that card remains exiled, you may play it if you control a Kavu.";

export default defineCard({
  name: "Possibility Technician",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Artificer"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\nWarp {1}{R} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{1}{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Kavu" } },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "while-exiled",
        gate: { kind: "controls", filter: { subtype: "Kavu" }, atLeast: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
