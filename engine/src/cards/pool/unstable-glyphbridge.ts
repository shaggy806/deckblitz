import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 8617.
//
// - "For each player, choose a creature with power 2 or less that player
//   controls" is The Eternal Wanderer's per-player choice (`vote` with
//   `choose`, `who: "you"`, `about: "each-player"`, `keep`): one must be
//   chosen for each player who has one, yourself included (its ruling), and
//   with only one there's nothing to ask. "Then destroy all creatures except
//   creatures chosen this way" is a `destroy-all` of what wasn't.
// - "If you cast it" is an intervening if on the enters trigger, from any
//   zone (its ruling); put onto the battlefield, nothing happens.
const ENTER_TEXT =
  "When this artifact enters, if you cast it, for each player, choose a creature with power 2 or less that player controls. Then destroy all creatures except creatures chosen this way.";
const CRAFT_TEXT =
  "Craft with artifact {3}{W}{W} ({3}{W}{W}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Unstable Glyphbridge",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "you",
            for: {
              permanent: { type: "creature", power: { op: "lte", n: 2 } },
              about: "each-player",
              keep: true,
              prompt: "Choose a creature with power 2 or less to spare",
            },
          },
          { kind: "destroy-all", filter: { type: "creature", notThisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [craft("{3}{W}{W}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {3}{W}{W}")],
  faces: ["Unstable Glyphbridge", "Sandswirl Wanderglyph"],
  transform: true,
});
