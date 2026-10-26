import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 27860.
//
// `powerOf: "tapped"` is the creature tapped for the cost, read as the ability
// resolves — as it last existed, if it has left (the first ruling). With no
// {T} in the cost, a summoning-sick creature can be tapped (the second).

const TEXT =
  "Tap an untapped red creature you control other than this creature: This creature gets +X/+0 until end of turn, where X is the power of the creature tapped this way.";

export default defineCard({
  name: "Impelled Giant",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", colors: ["R"], controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: { powerOf: "tapped" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
