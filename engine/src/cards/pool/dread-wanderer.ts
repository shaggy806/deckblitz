import { defineCard } from "../define.js";

// EDHREC rank 19103. Amonkhet. The return is activated from the graveyard
// (Grafted Butcher's shape): the card stays there as the cost is paid, and
// returns only if it's still the same card when the ability resolves (rule
// 400.7). The hand count is checked as it's activated (rule 602.5).

const RETURN_TEXT =
  "{2}{B}: Return this card from your graveyard to the battlefield. Activate only as a sorcery and only if you have one or fewer cards in hand.";

export default defineCard({
  name: "Dread Wanderer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Jackal"],
  power: 2,
  toughness: 1,
  text: `This creature enters tapped.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      condition: { kind: "hand-size", atMost: 1 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
