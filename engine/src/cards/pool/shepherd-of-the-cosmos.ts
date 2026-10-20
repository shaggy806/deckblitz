import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 16545. Angel of Indemnity's shape at mana value
// 2 or less; a permanent card is any card that isn't an instant or sorcery.
const ENTER_TEXT =
  "When this creature enters, return target permanent card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Shepherd of the Cosmos",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\nForetell {3}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  foretell: { cost: "{3}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
