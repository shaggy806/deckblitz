import { defineCard } from "../define.js";

// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
//   [2009-10-01] Activating the ability that turns it into a creature while it's already a
//     creature will override any effects that set its power and/or toughness to a specific number.
//     However, any effect that raises or lowers power and/or toughness (such as the effect created
//     by Giant Growth, Glorious Anthem, or a +1/+1 counter) will continue to apply.

const ANIMATE_TEXT =
  '{1}{B}: This land becomes a 1/1 black Skeleton creature with "{B}: Regenerate this creature" until end of turn. It\'s still a land.';

export default defineCard({
  name: "Spawning Pool",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B}.\n${ANIMATE_TEXT} (If it regenerates, the next time it would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 1,
            toughness: 1,
            addTypes: ["creature"],
            addSubtypes: ["Skeleton"],
            setColors: ["B"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-activated",
            target: "source",
            ability: {
              cost: { mana: "{B}", tap: false },
              targets: [],
              effect: { kind: "regenerate", target: "source" },
              resolve: null,
              text: "{B}: Regenerate this creature.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
