import { defineCard } from "../define.js";

// EDHREC rank 10234.
//
// "Any amount of {E}" is Harnessed Lightning's `costEnergyX: "any"`: declining
// is paying 0, and the rest happens with X = 0. Each player, from the active
// player, says whether they'll exile their hand, knowing the answers before
// theirs; then everyone who did exiles it and draws X together (the ruling —
// Arc of Fortune's `each-player-may`). With seven or more paid, the cards you
// own exiled from hands this way are yours to play, by their usual rules
// (a land as your land play), until the end of your next turn (Hex Magic's
// grant).

const TEXT =
  "You get {E}{E}{E} (three energy counters), then you may pay any amount of {E}.\nEach player may exile their hand and draw a number of cards equal to the amount of {E} paid this way. If seven or more {E} was paid this way, you may play cards you own exiled this way until the end of your next turn.";

export default defineCard({
  name: "Wheel of Potential",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 3 },
      {
        kind: "may",
        prompt: "Pay any amount of {E}? Each player may exile their hand and draw that many cards.",
        costEnergyX: "any",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "each-player-may",
              who: "each-player",
              prompt: "Exile your hand and draw that many cards?",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "exile-graveyard", target: "you", fromHand: "only" },
                  { kind: "draw", amount: "x" },
                ],
              },
            },
            {
              kind: "conditional",
              condition: { kind: "amounts", left: "x", op: "gte", right: 7 },
              then: {
                kind: "grant-play",
                cards: { thisWay: "exiled-from-hand", who: "you" },
                duration: "until-end-of-your-next-turn",
                play: true,
              },
            },
          ],
        },
      },
    ],
  },
});
