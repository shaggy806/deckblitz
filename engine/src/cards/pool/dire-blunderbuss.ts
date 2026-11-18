import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "Dire Blunderbuss" in the granted trigger is the Equipment that grants it
// (rule 201.5a), so "an artifact other than Dire Blunderbuss" leaves out that
// one object (`notObject: "granter"`) and not a second one of the same name.
// The reflexive ability triggers only once an artifact has been sacrificed
// (603.12), and the creature's power is read as it resolves, as it last
// existed if it has left (the ruling).

const GRANTED =
  "Whenever this creature attacks, you may sacrifice an artifact other than Dire Blunderbuss. When you do, this creature deals damage equal to its power to target creature.";
const TEXT = `Equipped creature gets +3/+0 and has "${GRANTED}"`;

export default defineCard({
  name: "Dire Blunderbuss",
  art: "https://cards.scryfall.io/art_crop/back/0/d/0d2d98ae-fe02-4a86-9e80-7b95e08de21c.jpg",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "each-player-may",
            who: "you",
            options: [
              {
                sacrifice: { type: "artifact", notObject: "granter" },
                text: "Sacrifice an artifact other than Dire Blunderbuss",
              },
            ],
            ifDid: {
              kind: "reflexive-trigger",
              targets: ["creature"],
              effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
              text: "When you do, this creature deals damage equal to its power to target creature.",
            },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
  faces: ["Dire Flail", "Dire Blunderbuss"],
  transform: true,
});
