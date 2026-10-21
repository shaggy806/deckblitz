import { defineCard } from "../define.js";

// EDHREC rank 31938. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] Whether you control an Oko planeswalker is checked only as you begin to
//     activate Bramblefort Fink's ability. It doesn't matter if Oko leaves the battlefield before
//     the ability resolves or later in the turn.
//
// Brokers Initiate's layer-7b base P/T, behind an activation `condition`.

const ABILITY_TEXT =
  "{8}: This creature has base power and toughness 10/10 until end of turn. Activate only if you control an Oko planeswalker.";

export default defineCard({
  name: "Bramblefort Fink",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 2,
  toughness: 2,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Oko" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 10,
        toughness: 10,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
