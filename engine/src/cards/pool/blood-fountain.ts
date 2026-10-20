import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const ENTERS_TEXT = "When this artifact enters, create a Blood token.";
const RETURN_TEXT =
  "{3}{B}, {T}, Sacrifice this artifact: Return up to two target creature cards from your graveyard to your hand.";

export default defineCard({
  name: "Blood Fountain",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  text:
    "When this artifact enters, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")\n" +
    RETURN_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: true, sacrifice: "self" },
      targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
