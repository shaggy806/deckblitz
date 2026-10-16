import { defineCard } from "../define.js";

const COMBAT_TEXT = "At the beginning of combat on your turn, each Merfolk creature you control explores.";
const ATTACK_TEXT =
  "Whenever Hakbal attacks, you may put a land card from your hand onto the battlefield. If you don't, draw a card.";

export default defineCard({
  name: "Hakbal of the Surging Soul",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 3,
  toughness: 3,
  text: `${COMBAT_TEXT} (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on the exploring creature, then put the card back or put it into your graveyard.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      // One at a time, in the order you choose (rule 701.44d).
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "explore", target: "source", each: { type: "creature", subtype: "Merfolk" } },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            filter: { type: "land" },
            destination: "battlefield",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atMost: 0 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
