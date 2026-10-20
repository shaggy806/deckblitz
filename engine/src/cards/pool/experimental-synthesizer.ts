import { defineCard } from "../define.js";

// EDHREC rank 9555.
//
// "When this artifact enters or leaves the battlefield" is one trigger
// condition over two events; it's written as an enters trigger and a
// leaves-battlefield trigger with the same impulse draw (Irascible
// Wolverine's), which is what it does — it fires once per event either way.
const IMPULSE_TEXT =
  "When this artifact enters or leaves the battlefield, exile the top card of your library. Until end of turn, you may play that card.";
const TOKEN_TEXT =
  "{2}{R}, Sacrifice this artifact: Create a 2/2 white Samurai creature token with vigilance. Activate only as a sorcery.";

export default defineCard({
  name: "Experimental Synthesizer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${IMPULSE_TEXT}\n${TOKEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: IMPULSE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: IMPULSE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Samurai Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
      sorcerySpeed: true,
    },
  ],
});
