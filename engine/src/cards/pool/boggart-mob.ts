import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 14458.
//
// Champion a Goblin (rule 702.72): the `champion` helper's two linked
// triggers. The Mob is a Goblin itself, so its own combat damage counts.

export default defineCard({
  name: "Boggart Mob",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 5,
  toughness: 5,
  text: "Champion a Goblin (When this enters, sacrifice it unless you exile another Goblin you control. When this leaves the battlefield, that card returns to the battlefield.)\nWhenever a Goblin you control deals combat damage to a player, you may create a 1/1 black Goblin Rogue creature token.",
  triggered: [
    ...champion({ subtype: "Goblin" }, "a Goblin"),
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { subtype: "Goblin" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 black Goblin Rogue creature token?",
        effect: { kind: "create-token", token: "Goblin Rogue Token", count: 1 },
      },
      resolve: null,
      text: "Whenever a Goblin you control deals combat damage to a player, you may create a 1/1 black Goblin Rogue creature token.",
    },
  ],
});
