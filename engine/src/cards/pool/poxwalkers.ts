import { defineCard } from "../define.js";

// EDHREC rank 8788.
//
// A graveyard ability (rule 113.6k — Sneaky Snacker's shape): it triggers only
// while the card is in your graveyard, on a spell you cast from anywhere but
// your hand (Vega, the Watcher's `notFrom: "hand"`), and it isn't optional.
const POX_TEXT =
  "Curse of the Walking Pox — Whenever you cast a spell from anywhere other than your hand, return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Poxwalkers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${POX_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: POX_TEXT,
    },
  ],
});
