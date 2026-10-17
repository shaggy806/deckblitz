import { defineCard } from "../define.js";

// EDHREC rank 14206.
//
// Rulings:
//   [2023-10-13] Paradox abilities count any spells cast from zones other than your hand. These
//     are usually spells cast from exile, the graveyard, or the command zone.
//   [2023-10-13] The Doctor's companion ability allows you to have two commanders if one has the
//     ability and the other is a legendary creature that is a Time Lord Doctor and has no other
//     creature types.
//
// Paradox is `notFrom: "hand"`; Doctor's companion is K-9, Mark I's pairing.
const PARADOX_TEXT =
  "Paradox — Whenever you cast a spell from anywhere other than your hand, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Graham O'Brien",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${PARADOX_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: PARADOX_TEXT,
    },
  ],
});
