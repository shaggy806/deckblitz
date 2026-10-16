import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of combat on your turn, this creature explores. Then you may have it become a copy of another creature you control until end of turn.";

export default defineCard({
  name: "Deepfathom Echo",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Spirit"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (To have this creature explore, reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "explore", target: "source" },
          // Not a target: the other creature is chosen as this resolves, and
          // choosing none is declining. Its counters stay (rule 707.4).
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            upTo: 1,
            then: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
            prompt: "You may choose another creature you control: Deepfathom Echo becomes a copy of it until end of turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
