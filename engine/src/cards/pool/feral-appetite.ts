import { defineCard } from "../define.js";

// EDHREC rank 8629. Blight Mound's anthem with deathtouch, and Mastermind
// Plum's "if a [type] card was exiled this way".
const ANTHEM_TEXT = "Attacking Pests you control get +1/+0 and have deathtouch.";
const EXILE_TEXT =
  "{1}{G}: Exile target card from a graveyard. If a creature card is exiled this way, create a 1/1 black and green Pest creature token with \"When this token dies, you gain 1 life.\"";

export default defineCard({
  name: "Feral Appetite",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Pest", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      grantKeywords: ["deathtouch"],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: { kind: "create-token", token: "Pest Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
