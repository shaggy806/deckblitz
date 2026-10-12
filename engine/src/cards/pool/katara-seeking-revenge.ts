import { defineCard } from "../define.js";

// EDHREC rank 22176.
//
// "You may waterbend {2}" is an optional additional cost (rule 601.2b), a
// kicker by another name: paying it is the kicked cast, and "her additional
// cost was paid" is `self-kicked` on the permanent she becomes. Put onto the
// battlefield any other way, it wasn't, and she loots.

const ENTER_TEXT = "When Katara enters, draw a card, then discard a card unless her additional cost was paid.";
const PUMP_TEXT = "Katara gets +1/+1 for each Lesson card in your graveyard.";

export default defineCard({
  name: "Katara, Seeking Revenge",
  manaCost: "{3}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 3,
  toughness: 3,
  text: `As an additional cost to cast this spell, you may waterbend {2}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\n${ENTER_TEXT}\n${PUMP_TEXT}`,
  kicker: { cost: "{2}", keyword: "waterbend" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "self-kicked" } },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { subtype: "Lesson", ownedBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
