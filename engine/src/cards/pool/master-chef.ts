import { defineCard } from "../define.js";

// The commander has both quoted replacements (`grantsStatic`). Its own "enters
// with" applies as it enters, since it'll have the ability there (rule 614.12,
// the ruling: entering beside other creatures, only it gets the counter); the
// other works from it while it's on the battlefield, "you" its controller.

const SELF = "This creature enters with an additional +1/+1 counter on it.";
const OTHERS = "Other creatures you control enter with an additional +1/+1 counter on them.";
const TEXT = `Commander creatures you own have "${SELF.slice(0, -1)}" and "${OTHERS}"`;

export default defineCard({
  name: "Master Chef",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
          text: SELF,
        },
        {
          affects: { scope: "self" },
          replacement: {
            event: "others-enter-battlefield",
            filter: { type: "creature", controlledBy: "you" },
            counters: { kind: "+1/+1", amount: 1 },
          },
          text: OTHERS,
        },
      ],
      text: TEXT,
    },
  ],
});
