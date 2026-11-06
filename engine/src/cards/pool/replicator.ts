import { defineCard } from "../define.js";

// EDHREC rank 24635.

const ENTER_TEXT =
  'When this artifact enters, create a Food token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const COPY_TEXT = "{2}, {T}: Create a tapped token that's a copy of target token you control.";

export default defineCard({
  name: "Replicator",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
      effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", tapped: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
