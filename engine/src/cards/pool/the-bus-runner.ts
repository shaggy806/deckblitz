import { defineCard } from "../define.js";

// "Ready to run (You can have two commanders if both have ready to run.)" is a
// partner-family ability shared by name, as "Friends forever" is (rule
// 702.124i): a `partner-group`.

const ENTERS_TEXT =
  "When The Bus Runner enters, create a 4/4 Desert Vehicle artifact land token with crew 2. Put eight hour counters on it. It has \"{T}: Add {C}\" and \"Whenever this token or a Gamer you control becomes tapped, remove an hour counter from this token. Then if it has no hour counters on it, each opponent loses 1 life, you gain 1 life, and put eight hour counters on this token.\"";

export default defineCard({
  name: "The Bus Runner",
  manaCost: "{1}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Gamer"],
  power: 3,
  toughness: 4,
  pairing: { kind: "partner-group", group: "Ready to run" },
  text: `${ENTERS_TEXT}\nReady to run (You can have two commanders if both have ready to run.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Desert Vehicle Token",
        count: 1,
        thenCounters: { kind: "hour", amount: 8 },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
