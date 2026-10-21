import { defineCard } from "../define.js";

// EDHREC rank 29286.

const RETURN_TEXT =
  "Whenever you cast a historic spell, you may pay {B}. If you do, return this card from your graveyard to your hand. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Lingering Phantom",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 4,
  text: RETURN_TEXT,
  triggered: [
    {
      fromGraveyard: true,
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return Lingering Phantom to your hand?",
        cost: "{B}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
