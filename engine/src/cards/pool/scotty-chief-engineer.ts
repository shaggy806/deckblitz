import { defineCard } from "../define.js";

// EDHREC rank 32494.

export default defineCard({
  name: "Scotty, Chief Engineer",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 4,
  text: "Tap an untapped artifact you control: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "artifact", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "Tap an untapped artifact you control: Target creature can't be blocked this turn.",
    },
  ],
});
