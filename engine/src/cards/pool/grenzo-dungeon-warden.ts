import { defineCard } from "../define.js";

// Conspiracy (CNS). Top-1000 commander #603. EDHREC rank 11375.
//
// Rulings:
//   If a replacement effect (such as that of Leyline of the Void) causes the card to be put from
//     your library directly into exile, you'll put it onto the battlefield from exile if it's a
//     creature card with appropriate power.
//   Compare Grenzo's power when the ability resolves with the power of the creature card in your
//     graveyard to determine if you put it onto the battlefield. If Grenzo isn't on the
//     battlefield at this time, use its last known power from when it was on the battlefield.
//   If the card is a creature card with power less than or equal to Grenzo's power, it's put onto
//     the battlefield from your graveyard, not from your library.
//
// `bottom-of-library` hands the bottom card to its `then` as target 0, and "it" follows the card
// to wherever the move put it (the first ruling). Not a mill: nothing that reads milling sees it.

const ENTERS_TEXT = "Grenzo enters with X +1/+1 counters on it.";
const ABILITY_TEXT =
  "{2}: Put the bottom card of your library into your graveyard. If it's a creature card with power less than or equal to Grenzo's power, put it onto the battlefield.";

export default defineCard({
  name: "Grenzo, Dungeon Warden",
  manaCost: "{X}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${ABILITY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "bottom-of-library",
        then: {
          kind: "sequence",
          effects: [
            { kind: "put-into-graveyard", target: 0 },
            {
              kind: "conditional",
              condition: {
                kind: "target",
                index: 0,
                filter: { type: "creature", power: { op: "lte", n: { amount: { powerOf: "source" } } } },
              },
              then: { kind: "put-onto-battlefield", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
