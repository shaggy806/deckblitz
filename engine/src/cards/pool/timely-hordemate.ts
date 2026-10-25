import { defineCard } from "../define.js";

// EDHREC rank 27565. Raid is the `attacked` turn stat.

export default defineCard({
  name: "Timely Hordemate",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Raid — When this creature enters, if you attacked this turn, return target creature card with mana value 2 or less from your graveyard to the battlefield.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, return target creature card with mana value 2 or less from your graveyard to the battlefield.",
    },
  ],
});
