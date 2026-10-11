import { defineCard } from "../define.js";

// EDHREC rank 11637. Marvel Super Heroes Commander.

const TEXT =
  "Whenever another Hero you control enters, it gains vigilance and haste until end of turn. Put a +1/+1 counter on that Hero and a +1/+1 counter on Captain America.";

export default defineCard({
  name: "Captain America, Team Leader",
  manaCost: "{R}{W}{U}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Hero" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "trigger-object", keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
