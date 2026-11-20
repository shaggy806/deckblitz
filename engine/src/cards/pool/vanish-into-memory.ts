import { defineCard } from "../define.js";

// Exile first, then the draw: `{ powerOf: 0 }` reads the creature as it last
// existed on the battlefield (rule 608.2h), counters and all. The return is a
// flicker's delayed half, linked to this exile (rule 610.3), so a card that
// left exile in between, or a token, never comes back. Its "if you do, discard
// cards equal to that creature's toughness" reads the object that came back
// (the rulings: a 2/2 with two +1/+1 counters draws four, then discards two),
// and only as a creature: a returned card that isn't one has no toughness
// (rule 208.3), and nothing that came back means no discard.
export default defineCard({
  name: "Vanish into Memory",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Exile target creature. You draw cards equal to that creature's power. At the beginning of your next upkeep, return that card to the battlefield under its owner's control. If you do, discard cards equal to that creature's toughness.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "flicker",
        target: 0,
        returnAt: { step: "upkeep", whose: "you" },
        returnText:
          "Return the exiled card to the battlefield under its owner's control. If you do, discard cards equal to that creature's toughness.",
        returnThen: {
          kind: "discard",
          target: "you",
          amount: {
            aggregate: "sum",
            of: "toughness",
            filter: { type: "creature", thisWay: "put-onto-battlefield" },
          },
        },
      },
      { kind: "draw", amount: { powerOf: 0 } },
    ],
  },
});
