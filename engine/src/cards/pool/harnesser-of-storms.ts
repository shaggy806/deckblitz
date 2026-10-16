import { defineCard } from "../define.js";

// EDHREC rank 8331. Bloomburrow.
//
// "A noncreature or Otter spell" is one filter with an `anyOf`. "Triggers
// only once each turn" counts the trigger, not the exile: declining the
// optional exile still uses it up. The card played from exile is paid for
// and timed as usual (the ruling).
const TEXT =
  "Whenever you cast a noncreature or Otter spell, you may exile the top card of your library. Until end of turn, you may play that card. This ability triggers only once each turn.";

export default defineCard({
  name: "Harnesser of Storms",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Otter", "Wizard"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ notTypes: ["creature"] }, { subtype: "Otter" }] },
      },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile the top card of your library? You may play it until end of turn.",
        effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
