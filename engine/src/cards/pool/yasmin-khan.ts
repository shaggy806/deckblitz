import { defineCard } from "../define.js";

// EDHREC rank 15874.
//
// Rulings:
//   [2023-10-13] You must pay all costs and follow all normal timing rules when playing a card
//     using Yasmin Khan's first ability. For example, you may play a land only during your main
//     phase while the stack is empty.
//   [2023-10-13] The Doctor's companion ability allows you to have two commanders if one has the
//     ability and the other is a legendary creature that is a Time Lord Doctor and has no other
//     creature types.
//
// Wiccan, Young Avenger's impulse draw (`your-next-end-step`) on a {T}
// ability; Doctor's companion is K-9, Mark I's pairing.
const TAP_TEXT = "{T}: Exile the top card of your library. Until your next end step, you may play it.";

export default defineCard({
  name: "Yasmin Khan",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 3,
  toughness: 3,
  pairing: { kind: "doctors-companion" },
  text: `${TAP_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-end-step" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
