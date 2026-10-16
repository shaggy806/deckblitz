import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// "If you controlled it" reads the returned creature as it last existed on
// the battlefield (rule 608.2h); with no target chosen, nothing is returned
// and there's no Clue.

const ENTER_TEXT =
  "When this creature enters, return up to one other target creature to its owner's hand. If you controlled it, investigate.";

export default defineCard({
  name: "Hotshot Investigators",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Detective"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { controlledBy: "you" } },
            then: investigate(),
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
