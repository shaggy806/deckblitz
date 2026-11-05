import { defineCard } from "../define.js";

// EDHREC rank 25816. The opponent the activator names chooses one of their own
// creatures as the target (`controlledBy: "chooser"`, Magus of the Arena's
// shape); the token is the activator's.

const TEXT =
  "{4}, {T}: An opponent chooses target creature they control. Create a token that's a copy of that creature. That token gains haste until end of turn. Exile the token at the beginning of the next end step. Activate only as a sorcery.";

export default defineCard({
  name: "Echo Chamber",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }],
      opponentChoosesTargets: [0],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        gainUntilEndOfTurn: ["haste"],
        exileAtEndStep: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
