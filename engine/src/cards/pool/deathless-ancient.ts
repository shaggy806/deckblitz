import { defineCard } from "../define.js";

// EDHREC rank 26638. Ixalan. Activated only from your graveyard (the ruling);
// the cost taps three untapped Vampires you control, summoning-sick ones
// included, since it isn't {T} (the ruling).
const TEXT = "Tap three untapped Vampires you control: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Deathless Ancient",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 3, filter: { subtype: "Vampire", controlledBy: "you" } },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
