import { defineCard } from "../define.js";

const ENTERS = "When Bumi enters, choose up to X, where X is the number of Lesson cards in your graveyard —";

// Each mode at most once, however large X is (its ruling).
export default defineCard({
  name: "Bumi, King of Three Trials",
  manaCost: "{5}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 4,
  toughness: 4,
  text: `${ENTERS}\n• Put three +1/+1 counters on Bumi.\n• Target player scries 3.\n• Earthbend 3. (Target land you control becomes a 0/0 creature with haste that's still a land. Put three +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: { countInGraveyard: { subtype: "Lesson", ownedBy: "you" } },
        modes: [
          { text: "Put three +1/+1 counters on Bumi.", effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 } },
          {
            text: "Target player scries 3.",
            targets: ["player"],
            effect: { kind: "as-player", who: { target: 0 }, effect: { kind: "scry", amount: 3 } },
          },
          { text: "Earthbend 3.", targets: ["land-you-control"], effect: { kind: "earthbend", target: 0, amount: 3 } },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
