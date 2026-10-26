import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 11892.
//
// Champion an Elf (rule 702.72): the `champion` helper's two linked triggers.
// Makes Wolf → use "Wolf Token".
//
// Rulings:
//   [2007-10-01] Wren's Run Packmaster gives deathtouch to all Wolf permanents you control, not
//     just the tokens it creates.
//   [2009-10-01] A Wolf's deathtouch ability will apply if both Wren's Run Packmaster and that
//     Wolf are on the battlefield at the time the Wolf deals damage. The creature dealt damage by
//     the Wolf will be destroyed the next time state-based actions are checked, even if the Wolf
//     or Wren's Run Packmaster leaves the battlefield.

export default defineCard({
  name: "Wren's Run Packmaster",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 5,
  toughness: 5,
  text: "Champion an Elf (When this creature enters, sacrifice it unless you exile another Elf you control. When this creature leaves the battlefield, that card returns to the battlefield.)\n{2}{G}: Create a 2/2 green Wolf creature token.\nWolves you control have deathtouch.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "{2}{G}: Create a 2/2 green Wolf creature token.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Wolf", controlledBy: "you" } },
      grantKeywords: ["deathtouch"],
      text: "Wolves you control have deathtouch.",
    },
  ],
  triggered: champion({ subtype: "Elf" }, "an Elf"),
});
