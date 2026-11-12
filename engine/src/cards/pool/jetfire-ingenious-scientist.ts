import { defineCard } from "../define.js";

// EDHREC rank 11863. Front face. More Than Meets the Eye (rule 702.162a);
// convert is transform. The removed counters are the ability's X (Retribution
// of the Ancients' cost, at least one); it targets, so it isn't a mana ability
// (the ruling). The mana is the Mightstone's "can't be spent to cast
// nonartifact spells".

const MANA_TEXT =
  "Remove one or more +1/+1 counters from among artifacts you control: Target player adds that much {C}. This mana can't be spent to cast nonartifact spells. Convert Jetfire.";

export default defineCard({
  name: "Jetfire, Ingenious Scientist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `More Than Meets the Eye {3}{U} (You may cast this card converted for {3}{U}.)\nFlying\n${MANA_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        removeCounter: { kind: "+1/+1", count: "x", from: { type: "artifact" }, among: true },
      },
      minX: 1,
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "add-mana",
            mana: "C",
            amount: "x",
            target: 0,
            spendOnly: {
              notSpell: { notTypes: ["artifact"] },
              text: "This mana can't be spent to cast nonartifact spells.",
            },
          },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  faces: ["Jetfire, Ingenious Scientist", "Jetfire, Air Guardian"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{3}{U}" },
});
