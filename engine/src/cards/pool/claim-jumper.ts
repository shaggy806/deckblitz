import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Outlaws of Thunder Junction Commander. The first "if" is an intervening one
// (rule 603.4, the ruling): no trigger unless an opponent has more lands, and
// it's asked again as it resolves. The second is read after the first search,
// which can have closed the gap, and doesn't depend on your having searched:
// "you may" is the process, so declining the first search doesn't stop the
// second. One shuffle at the end, if either search was made.

const TEXT =
  "When this creature enters, if an opponent controls more lands than you, you may search your library for a Plains card and put it onto the battlefield tapped. Then if an opponent controls more lands than you, repeat this process once. If you search your library this way, shuffle.";

const SEARCH: EffectSpec = {
  kind: "may",
  prompt: "Search your library for a Plains card?",
  effect: {
    kind: "search-library",
    filter: { subtype: "Plains" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: 1,
    shufflesLater: true,
  },
};

export default defineCard({
  name: "Claim Jumper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit", "Mercenary"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          SEARCH,
          { kind: "conditional", condition: { kind: "opponent-controls-more", filter: { type: "land" } }, then: SEARCH },
          { kind: "shuffle-library", searchers: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
