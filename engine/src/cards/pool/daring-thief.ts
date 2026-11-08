import { defineCard } from "../define.js";

// EDHREC rank 13799.
//
// Rulings:
//   [2014-04-26] Although the permanent you control can't be a land, the other target can,
//     provided it shares a card type with the first target.
//   [2014-04-26] The exchange of control lasts indefinitely.
//   [2014-04-26] If the full exchange can't happen, perhaps because one of the targets is illegal
//     as the inspired ability tries to resolve, then nothing happens.
//
// The second slot shares a card type with the first (`shares` — Burglar's
// Plot), checked as targets are chosen and again as it resolves.
const TEXT =
  "Inspired — Whenever this creature becomes untapped, you may exchange control of target nonland permanent you control and target permanent an opponent controls that shares a card type with it.";

export default defineCard({
  name: "Daring Thief",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "becomes-untapped", who: "self" },
      targets: [
        { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } },
        { kind: "other", of: { kind: "permanent", whose: "opponent", filter: {} }, than: { slot: 0 }, shares: { kind: "card" } },
      ],
      effect: {
        kind: "may",
        prompt: "Exchange control of the two target permanents?",
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
