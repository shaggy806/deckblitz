import { defineCard } from "../define.js";

const RAID_TEXT =
  "Raid — When this creature enters, if you attacked this turn, look at the top three cards of your library. You may put one of those cards back on top of your library. Put the rest into your graveyard.";

export default defineCard({
  name: "Gutless Plunderer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${RAID_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Raid's intervening "if" (rule 603.4): the whole turn counts, whether
      // or not the attacker is still around (the rulings).
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      // Fewer than three cards: look at all of them, the same instructions (the ruling).
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 0,
        max: 1,
        destination: "library-top",
        leftover: "graveyard",
      },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
