import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 10289.
//
// Rulings:
//   [2016-06-08] If Sengir Autocrat leaves the battlefield while its first ability is on the
//     stack, its second ability triggers and exiles any Serf tokens that happen to be on the
//     battlefield, and then its first ability resolves and gives you three Serf tokens.
//   [2016-06-08] Sengir Autocrat's last ability exiles all Serf tokens, not just the Serf tokens
//     its first ability created.
//
// "All Serf tokens" is every player's, so the exile filter names no controller.

const ENTERS = "When this creature enters, create three 0/1 black Serf creature tokens.";
const LEAVES = "When this creature leaves the battlefield, exile all Serf tokens.";

export default defineCard({
  name: "Sengir Autocrat",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Serf Token", count: 3 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { token: true, subtype: "Serf" } },
      resolve: null,
      text: LEAVES,
    },
  ],
});
