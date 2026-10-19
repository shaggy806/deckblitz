import { defineCard } from "../define.js";

// EDHREC rank 12085. Grey Host Reinforcements' enters trigger.

const SCAVENGE_TEXT =
  "Scavenge the Dead — When this creature enters, exile target player's graveyard. Put a +1/+1 counter on this creature for each creature card exiled this way.";

export default defineCard({
  name: "Malanthrope",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${SCAVENGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: 0 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { thisWay: "exiled", filter: { type: "creature" } },
          },
        ],
      },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});
