import { defineCard } from "../define.js";

const FIGHT_TEXT = "When this token enters, it fights up to one target creature you don't control.";

export default defineCard({
  name: "Aggressive Biomancy",
  manaCost: "{X}{X}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text: `Create X tokens that are copies of target creature you control, except they have "${FIGHT_TEXT}"`,
  targets: ["creature-you-control"],
  effect: {
    kind: "create-token-copy",
    of: 0,
    count: "x",
    who: "you",
    exceptions: {
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
          effect: { kind: "fight", a: "source", b: 0 },
          resolve: null,
          text: FIGHT_TEXT,
        },
      ],
    },
  },
});
