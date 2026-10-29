import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, target player shuffles any number of target cards from their graveyard into their library.";

export default defineCard({
  name: "Loaming Shaman",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Shaman"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        "player",
        { kind: "any-number", of: { kind: "card-in-graveyard" }, sameController: { slot: 0 } },
      ],
      // The rulings: no cards (or only illegal ones), the player just
      // shuffles; the player gone illegal, nothing happens.
      effect: {
        kind: "conditional",
        condition: { kind: "target-legal", index: 0 },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 1,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 1, position: "top" },
            },
            { kind: "shuffle-library", target: 0 },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
