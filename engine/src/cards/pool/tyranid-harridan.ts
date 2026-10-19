import { defineCard } from "../define.js";
import { thisOrAnother, ward } from "../helpers.js";

// EDHREC rank 15259.
//
// "This creature or another Tyranid you control" is two triggers
// (`thisOrAnother`, Millicent's shape): the creature itself counts even if it
// has stopped being a Tyranid.

const GARGOYLES_TEXT =
  "Shrieking Gargoyles — Whenever this creature or another Tyranid you control deals combat damage to a player, create a 1/1 blue Tyranid Gargoyle creature token with flying.";

export default defineCard({
  name: "Tyranid Harridan",
  manaCost: "{4}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying, ward {4}\n${GARGOYLES_TEXT}`,
  triggered: [
    ward({ mana: "{4}" }),
    ...thisOrAnother({
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Tyranid" } },
      targets: [],
      effect: { kind: "create-token", token: "Tyranid Gargoyle Token", count: 1 },
      resolve: null,
      text: GARGOYLES_TEXT,
    }),
  ],
});
