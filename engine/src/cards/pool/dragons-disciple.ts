import { defineCard } from "../define.js";

// EDHREC rank 19599.
//
// "As this creature enters" (rules 614.1c, 614.12): the reveal is asked as it
// is about to enter (`asEnters.reveal`, up to one Dragon card from the hand,
// rule 701.20a), and the counter is its replacement's `ifDone` — a card
// revealed, or a Dragon already controlled as it enters.
const ENTERS =
  "As this creature enters, you may reveal a Dragon card from your hand. If you do or if you control a Dragon, this creature enters with a +1/+1 counter on it.";
const WARD = "Dragons you control have ward {1}.";

export default defineCard({
  name: "Dragon's Disciple",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 3,
  text: `${ENTERS}\n${WARD}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { reveal: { filter: { subtype: "Dragon" }, upTo: 1 } },
        counters: {
          kind: "+1/+1",
          amount: 1,
          ifDone: { orIf: { kind: "controls", filter: { subtype: "Dragon" }, atLeast: 1 } },
        },
      },
      text: ENTERS,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Dragon", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{1}" } },
          resolve: null,
          text: "Ward {1}",
        },
      ],
      text: WARD,
    },
  ],
});
