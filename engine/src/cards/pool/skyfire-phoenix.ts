import { defineCard } from "../define.js";

// EDHREC rank 12743. A graveyard trigger (Poxwalkers' shape) on casting your
// commander, from anywhere; it resolves before the commander spell, even if
// that spell is countered (the ruling).

const TEXT = "When you cast your commander, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Skyfire Phoenix",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { isCommander: true, ownedBy: "you" } },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
