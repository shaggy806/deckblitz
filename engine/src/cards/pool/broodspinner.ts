import { defineCard } from "../define.js";

// EDHREC rank 10592. Sacrificed as the cost is paid, Broodspinner is in the
// graveyard by the time the count is made, so it gives "creature".
const SURVEIL = "When this creature enters, surveil 2.";
const INSECTS =
  "{4}{B}{G}, {T}, Sacrifice this creature: Create a number of 1/1 black and green Insect creature tokens with flying equal to the number of card types among cards in your graveyard.";

export default defineCard({
  name: "Broodspinner",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${SURVEIL} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${INSECTS}`,
  activated: [
    {
      cost: { mana: "{4}{B}{G}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Insect Token (Infestation Sage)",
        count: { cardTypesInGraveyard: { ownedBy: "you" } },
      },
      resolve: null,
      text: INSECTS,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL,
    },
  ],
});
