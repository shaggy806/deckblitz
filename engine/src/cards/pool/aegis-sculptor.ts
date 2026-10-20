import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 21949.
//
// "You may exile two cards from your graveyard. If you do": the two are
// chosen as it resolves; fewer than two exiled (a smaller graveyard) isn't
// having done it (Emeritus of Ideation's shape).

const WARD_TEXT =
  "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may exile two cards from your graveyard. If you do, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Aegis Sculptor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${WARD_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // With fewer cards in your graveyard than it exiles, "exile them" is an
      // impossible option, so it isn't offered (rule 608.2d): nothing is exiled.
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Exile two cards from your graveyard?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 2,
                max: 2,
                destination: "exile",
                leftover: "stay",
              },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "exiled", atLeast: 2 },
                then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              },
            ],
          },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
