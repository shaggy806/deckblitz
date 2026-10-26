import { defineCard } from "../define.js";

// EDHREC rank 29123.
//
// The delayed trigger is about the three tokens this resolution created
// (`about: "created"`), each exiled at the beginning of the next cleanup step
// (rule 514.3a: a trigger then gives players priority).

export default defineCard({
  name: "Waylay",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create three 2/2 white Knight creature tokens. Exile them at the beginning of the next cleanup step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "2/2 White Knight Token", count: 3 },
      {
        kind: "delayed-trigger",
        at: "next-cleanup",
        about: "created",
        effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 } },
        text: "Exile those tokens.",
      },
    ],
  },
});
