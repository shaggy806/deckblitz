import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 12223.
//
// Mishra's Factory's shape: the land keeps its types and abilities and
// becomes a 4/2 Golem artifact creature until end of turn.
const ANIMATE_TEXT = "{4}: This land becomes a 4/2 Golem artifact creature until end of turn. It's still a land.";

export default defineCard({
  name: "Dread Statuary",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Golem"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
