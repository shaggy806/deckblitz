import { defineCard } from "../define.js";

// The cost is a `do` act: three cards chosen from the graveyard as it's paid,
// put on the bottom of the library (their order the owner's, rule 401.4) —
// a library move, so paid after the rest (601.2h). Threshold is read as it
// begins to be activated (602.5), before the cost takes the three away.
const TEXT =
  "Threshold — Put three cards from your graveyard on the bottom of your library: This creature gets +3/+3 until end of turn. Activate only once each turn and only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Battlefield Scrounger",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        do: { kind: "look-and-choose", zone: "graveyard", min: 3, max: 3, destination: "library-bottom", leftover: "stay" },
      },
      condition: { kind: "threshold" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
