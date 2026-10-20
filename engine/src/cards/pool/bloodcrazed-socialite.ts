import { defineCard } from "../define.js";

// EDHREC rank 15442.
//
// Rulings:
//   [2021-11-19] If an effect refers to a Blood token, it means any artifact token with the
//     subtype Blood, even if it has gained other subtypes.
//   [2021-11-19] Some triggered abilities trigger "whenever you sacrifice a Blood token." These
//     abilities trigger regardless of why you sacrificed that Blood token.
//   [2021-11-19] You can't sacrifice a Blood token to pay multiple costs.
//
// Comet Crawler's optional sacrifice; a Blood token is any artifact token
// with the subtype Blood (the first ruling).

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice a Blood token. If you do, it gets +2/+2 until end of turn.";

export default defineCard({
  name: "Bloodcrazed Socialite",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\nWhen this creature enters, create a Blood token. (It's an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Blood token.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact", subtype: "Blood", token: true }, text: "Sacrifice a Blood token" }],
        ifDid: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
