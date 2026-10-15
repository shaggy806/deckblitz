import { defineCard } from "../define.js";

// EDHREC rank 19139.
//
// Crimson Operative's impulse draw (played under the usual costs and timing —
// the ruling), and basic landcycling.

const ENTER_TEXT =
  "When this creature enters, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Kulrath Zealot",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{1}{R}", search: { supertype: "basic", type: "land" } },
  text: `${ENTER_TEXT}\nBasic landcycling {1}{R} ({1}{R}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
