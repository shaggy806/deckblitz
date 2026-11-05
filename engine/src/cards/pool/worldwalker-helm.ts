import { defineCard } from "../define.js";

const TOKEN_TEXT =
  "If you would create one or more artifact tokens, instead create those tokens plus an additional Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")";
const COPY_TEXT = "{1}{U}, {T}: Create a token that's a copy of target artifact token you control.";

export default defineCard({
  name: "Worldwalker Helm",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${TOKEN_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusOneToken: "Map Token", ofTokens: { type: "artifact" } },
      text: TOKEN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "artifact", token: true, controlledBy: "you" } }],
      effect: { kind: "create-token-copy", of: 0, count: 1 },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
