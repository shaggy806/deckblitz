import { defineCard } from "../define.js";

// The back face of Magik, Illyana Rasputin (a modal DFC — see
// magik-illyana-rasputin.ts). Every card the upkeep trigger exiles, the lands
// on the way and the nonland card it stops at, may be played this turn: the
// `reveal-until` leaves them all in exile and the `grant-play` reads them as
// the cards exiled this way. With no nonland card left, the whole library is
// exiled and every card of it may be played.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile cards from the top of your library until you exile a nonland card. You may play those cards this turn.";
const LIFE_TEXT = "Pay 4 life: Darkchild gains indestructible until end of turn. Tap her.";

export default defineCard({
  name: "Darkchild, Demon Uncaged",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Demon", "Sorcerer"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-until", filter: { notTypes: ["land"] }, exile: true, rest: "stay" },
          { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "end-of-turn", play: true },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 4 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  faces: ["Magik, Illyana Rasputin", "Darkchild, Demon Uncaged"],
});
