import { defineCard } from "../define.js";

// EDHREC rank 15829.

/** Its last ability works while it's suspended (`whileSuspended`). */
export default defineCard({
  name: "Nihilith",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSuspend 7—{1}{B}\nWhenever a card is put into an opponent's graveyard from anywhere, if this card is suspended, you may remove a time counter from this card.",
  suspend: { n: 7, cost: "{1}{B}" },
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "opponent" },
      whileSuspended: true,
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a time counter from Nihilith?",
        effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      },
      resolve: null,
      text: "Whenever a card is put into an opponent's graveyard from anywhere, if this card is suspended, you may remove a time counter from this card.",
    },
  ],
});
