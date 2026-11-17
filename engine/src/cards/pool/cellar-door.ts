import { defineCard } from "../define.js";

// Innistrad (ISD).
//
// `bottom-of-library` with `whose: 0`, the target player's: the bottom card goes to `then` as
// target 0, and "it" is read where the move put it. Not a mill: nothing that reads milling sees it.

const TEXT =
  "{3}, {T}: Target player puts the bottom card of their library into their graveyard. If it's a creature card, you create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Cellar Door",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      effect: {
        kind: "bottom-of-library",
        whose: 0,
        then: {
          kind: "sequence",
          effects: [
            { kind: "put-into-graveyard", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "creature" } },
              then: { kind: "create-token", token: "Zombie Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
