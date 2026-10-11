import { defineCard } from "../define.js";

// Rulings: the three Zombie creature cards must be in your graveyard before
// you begin to activate — a Zombie sacrificed for the cost doesn't count
// toward them (the `condition` is checked before costs are paid) — but it is
// among the cards the ability may return (`choose-random-card` reads the
// graveyard as it resolves).

const ANTHEM = "Other Zombies you control get +1/+1.";
const RETURN =
  "{2}{B}, {T}, Sacrifice a creature: Return a Zombie creature card at random from your graveyard to the battlefield. Activate only during your turn and only if there are at least three Zombie creature cards in your graveyard.";

export default defineCard({
  name: "Tomb Tyrant",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Noble"],
  power: 3,
  toughness: 3,
  text: `${ANTHEM}\n${RETURN}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Zombie", excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { type: "creature", subtype: "Zombie" },
        then: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature", subtype: "Zombie" } },
        ],
      },
      text: RETURN,
    },
  ],
});
