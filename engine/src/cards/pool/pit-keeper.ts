import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 20638. Oversold Cemetery's intervening-if on
// an enters trigger.

const TEXT =
  "When this creature enters, if you have four or more creature cards in your graveyard, you may return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Pit Keeper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "creature" } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target creature card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
