import { defineCard } from "../define.js";

// Death Tyrant's graveyard return, with a cost exiling seven *other* cards
// (`exileFromGraveyard` never counts the source).
const TEXT =
  "{3}{B}{B}, Exile seven other cards from your graveyard: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Bone Dragon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon", "Skeleton"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: false, exileFromGraveyard: { count: 7 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
