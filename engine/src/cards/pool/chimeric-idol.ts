import { defineCard } from "../define.js";

// EDHREC rank 29222.
//
// Rulings: the lands are tapped by the effect, not as a cost — so the
// `tap-all` resolves first and the ability can be activated with every land
// already tapped. The animation keeps its other types (it's already an
// artifact) and sets base P/T 3/3 (layer 7b).

const TEXT = "{0}: Tap all lands you control. This artifact becomes a 3/3 Turtle artifact creature until end of turn.";

export default defineCard({
  name: "Chimeric Idol",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap-all", filter: { type: "land", controlledBy: "you" } },
          {
            kind: "animate",
            target: "source",
            power: 3,
            toughness: 3,
            addTypes: ["artifact", "creature"],
            addSubtypes: ["Turtle"],
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
