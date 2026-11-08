import { defineCard } from "../define.js";

// "That many" is the number of creatures exiled this way, remembered by the
// delayed ability as it's made (theme 15's captured context): it doesn't
// change if the exiled cards move on before the end step, and a token
// exiled this way counts though it ceased to exist (each token is a
// creature exiled). Nothing exiled, nothing to reveal for.
const DELAYED_TEXT =
  "At the beginning of the next end step, reveal cards from the top of your library until you reveal that many creature cards, put all creature cards revealed this way onto the battlefield, then shuffle the rest of the revealed cards into your library.";

export default defineCard({
  name: "Synthetic Destiny",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Exile all creatures you control. ${DELAYED_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature", controlledBy: "you" } },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        remember: { exiled: { set: { thisWay: "exiled" } } },
        effect: {
          kind: "reveal-until-count",
          filter: { type: "creature" },
          count: { aggregate: "count", filter: {}, in: { remembered: "exiled" } },
          put: "battlefield",
          rest: "shuffle",
        },
        text: DELAYED_TEXT,
      },
    ],
  },
});
