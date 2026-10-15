import { defineCard } from "../define.js";

// EDHREC rank 30689.
//
// Reassembling Skeleton's shape: an ability that works only in the graveyard
// (rule 113.6k) whose cost doesn't move the card itself (`staysInZone`). The
// exile cost never counts Gallia herself ("another").
const RETURN_TEXT =
  "{4}{B}, Exile another creature card from your graveyard: Return this card from your graveyard to the battlefield tapped with a +1/+1 counter on her.";

export default defineCard({
  name: "Gallia, Tragic Host",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Satyr"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "source",
        enterTapped: true,
        withCounters: { kind: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
