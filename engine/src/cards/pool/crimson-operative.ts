import { defineCard } from "../define.js";

// EDHREC rank 23594.
// The impulse is Cori Mountain Monastery's: playable through the end of
// your next turn.

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const ETB_TEXT =
  "When this creature enters, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Crimson Operative",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
