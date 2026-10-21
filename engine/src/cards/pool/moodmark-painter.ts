import { defineCard } from "../define.js";

// EDHREC rank 26098. Guilds of Ravnica. X is read as the trigger resolves (the
// ruling); with no creature cards in your graveyard it just gains menace.

const ETB_TEXT =
  "Undergrowth — When this creature enters, target creature gains menace and gets +X/+0 until end of turn, where X is the number of creature cards in your graveyard.";

export default defineCard({
  name: "Moodmark Painter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
          {
            kind: "modify-pt",
            target: 0,
            power: { countInGraveyard: { type: "creature", ownedBy: "you" } },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
