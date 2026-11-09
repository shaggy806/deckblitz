import { defineCard } from "../define.js";

// EDHREC rank 7900. Lavaclaw Reaches' animation and granted ability, the
// ability Phantasmal Fiend's switch.

const ANIMATE_TEXT =
  '{2}{U}{R}: Until end of turn, this land becomes a 1/4 blue and red Elemental creature with "{0}: Switch this creature\'s power and toughness until end of turn." It\'s still a land.';

export default defineCard({
  name: "Wandering Fumarole",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {U} or {R}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {R}.",
    },
    {
      cost: { mana: "{2}{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: "source",
            power: 1,
            toughness: 4,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            setColors: ["U", "R"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-activated",
            target: "source",
            ability: {
              cost: { mana: "{0}", tap: false },
              targets: [],
              effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
              resolve: null,
              text: "{0}: Switch this creature's power and toughness until end of turn.",
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
