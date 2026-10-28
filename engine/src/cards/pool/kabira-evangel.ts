import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 8511.
//
// Rulings:
//   [2009-10-01] You choose a color (or choose not to) as the triggered ability resolves. Once the
//     color is chosen, it's too late for players to respond.

const TEXT =
  "Whenever this creature or another Ally you control enters, you may choose a color. If you do, Allies you control gain protection from the chosen color until end of turn.";

export default defineCard({
  name: "Kabira Evangel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Ally"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "grant-protection",
        filter: { subtype: "Ally", controlledBy: "you" },
        from: { choose: "color", optional: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
