import { defineCard } from "../define.js";

// A 2/2 green Ooze with "When this token dies, create two 1/1 green Ooze
// creature tokens" (Mitotic Slime). "Ooze Token" is the vanilla 2/2; the
// engine keys tokens by name, so this one has its own key and gets its
// in-game name (rule 111.4) from `tokenName`.
const TEXT = "When this token dies, create two 1/1 green Ooze creature tokens.";

export default defineCard({
  name: "2/2 Splitting Ooze Token",
  tokenName: "Ooze Token",
  art: "6c746fd1-0731-4c6d-9eb8-6048238ce6d1",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Ooze Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
