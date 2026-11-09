import { defineCard } from "../define.js";
import { crew, ward } from "../helpers.js";

const CREWED_TEXT =
  'Whenever this Vehicle becomes crewed for the first time each turn, if it was crewed by exactly two creatures, it gains "Whenever this creature deals combat damage to a player, draw two cards" until end of turn.';

// EDHREC rank 6127.
export default defineCard({
  name: "Mighty Servant of Leuk-o",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\nWard—Discard a card.\n${CREWED_TEXT}\nCrew 4`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: { on: "event", event: "becomes-crewed", who: "self", firstTimeEachTurn: true },
      condition: { kind: "amounts", left: { triggerValue: true }, op: "eq", right: 2 },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        duration: "end-of-turn",
        triggered: [
          {
            trigger: { on: "deals-combat-damage-to-player", who: "self" },
            targets: [],
            effect: { kind: "draw", amount: 2 },
            resolve: null,
            text: "Whenever this creature deals combat damage to a player, draw two cards.",
          },
        ],
      },
      resolve: null,
      text: CREWED_TEXT,
    },
  ],
  activated: [crew(4)],
});
