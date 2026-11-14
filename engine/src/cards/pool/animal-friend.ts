import { defineCard } from "../define.js";

// EDHREC rank 10187. "Attached to this creature": the creature's own
// attachments, as it last existed if it has left (rule 608.2h); "other than
// Animal Friend" is the Aura granting the ability (`excludeGranter`), not
// another Animal Friend. The token enters as a 1/1, then gets its counters
// (the ruling).
const GRANTED =
  "Whenever this creature attacks, create a 1/1 green Squirrel creature token. Put a +1/+1 counter on that token for each Aura and Equipment attached to this creature other than Animal Friend.";

export default defineCard({
  name: "Animal Friend",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "create-token", token: "Squirrel Token", count: 1 },
              {
                kind: "add-counter",
                target: "created",
                counter: "+1/+1",
                amount: {
                  aggregate: "count",
                  filter: { subtypes: ["Aura", "Equipment"] },
                  in: { attachmentsOf: "source" },
                  excludeGranter: true,
                },
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
