import { defineCard } from "../define.js";

const TEXT =
  "When The Mouth of Sauron enters, target player mills three cards. Then amass Orcs X, where X is the number of instant and sorcery cards in that player's graveyard.";

export default defineCard({
  name: "The Mouth of Sauron",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (Put X +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 3 },
          {
            kind: "amass",
            amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" }, forTarget: 0 },
            creatureType: "Orc",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
