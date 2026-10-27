import { defineCard } from "../define.js";

// EDHREC rank 19762.

export default defineCard({
  name: "Triskelavus",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature enters with three +1/+1 counters on it.\n{1}, Remove a +1/+1 counter from this creature: Create a 1/1 colorless Triskelavite artifact creature token with flying. It has \"Sacrifice this token: This token deals 1 damage to any target.\"",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Triskelavite Token", count: 1 },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: Create a 1/1 colorless Triskelavite artifact creature token with flying. It has \"Sacrifice this token: This token deals 1 damage to any target.\"",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
