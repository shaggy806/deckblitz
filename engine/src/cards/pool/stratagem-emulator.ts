import { defineCard } from "../define.js";

// Star Trek Commander (TRC). X is its power as it last existed on the
// battlefield.

const TEXT = "When this creature dies, create X 1/1 colorless Borg artifact creature tokens, where X is its power.";

export default defineCard({
  name: "Stratagem Emulator",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Borg Token", count: { powerOf: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
