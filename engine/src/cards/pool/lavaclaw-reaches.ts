import { defineCard } from "../define.js";

// EDHREC rank 7838.
//
// Rulings:
//   When a land becomes a creature, that doesn't count as having a creature enter.
//   A land that becomes a creature may be affected by "summoning sickness."
//
// Restless Vents' animation, then the "{X}: +X/+0" ability granted to the land
// for the same turn (`grant-activated` on the source).

const ANIMATE_TEXT =
  '{1}{B}{R}: Until end of turn, this land becomes a 2/2 black and red Elemental creature with "{X}: This creature gets +X/+0 until end of turn." It\'s still a land.';

export default defineCard({
  name: "Lavaclaw Reaches",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B} or {R}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {R}.",
    },
    {
      cost: { mana: "{1}{B}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 2,
            toughness: 2,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            setColors: ["B", "R"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-activated",
            target: "source",
            ability: {
              cost: { mana: "{X}", tap: false },
              targets: [],
              effect: { kind: "modify-pt", target: "source", power: "x", toughness: 0, duration: "end-of-turn" },
              resolve: null,
              text: "{X}: This creature gets +X/+0 until end of turn.",
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
