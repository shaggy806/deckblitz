import { defineCard } from "../define.js";

/**
 * The Value Knight's token — a *named legendary* 1/1 red artifact creature
 * Food Knight. No token printing (the playtest card's text defines it). The
 * draw replacement lasts the turn and replaces every draw of its controller's
 * in it, each one drawing two.
 */
const TEXT =
  "{2}, {T}, Sacrifice this token: You gain 3 life. Until end of turn, if you would draw a card, draw two cards instead.";

export default defineCard({
  name: "Syr Acha",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Knight"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          {
            kind: "replacement-effect",
            duration: "end-of-turn",
            replacement: {
              event: "would-draw",
              who: "you",
              instead: { effect: { kind: "draw", amount: 2 }, text: "Draw two cards instead." },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
