import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 4567.
//
// Rulings:
//   If you control more than one Ancient Adamantoise, you choose which
//     redirection effect to apply. You can't divide damage dealt by a single
//     source between them.
//   Effects that remove all damage from a permanent (such as regeneration)
//     will still remove damage from Ancient Adamantoise.
//   If, during your cleanup step, Ancient Adamantoise is phased out with damage
//     marked on it, its second ability won't apply and all marked damage will
//     be removed from it during that cleanup step.
//
// Palisade Giant's redirection; `keepsDamageInCleanup` passes it by at
// cleanup (rule 514.2). "Exile it" is the card the dies trigger is about.

const KEEP_TEXT = "Damage isn't removed from this creature during cleanup steps.";
const REDIRECT_TEXT =
  "All damage that would be dealt to you and other permanents you control is dealt to this creature instead.";
const DIES_TEXT = "When this creature dies, exile it and create ten tapped Treasure tokens.";

export default defineCard({
  name: "Ancient Adamantoise",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 8,
  toughness: 20,
  keywords: ["vigilance"],
  text: `Vigilance, ward {3}\n${KEEP_TEXT}\n${REDIRECT_TEXT}\n${DIES_TEXT}`,
  static: [
    { affects: { scope: "self" }, keepsDamageInCleanup: true, text: KEEP_TEXT },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "your-side", toOther: true, instead: { redirect: "self" } },
      text: REDIRECT_TEXT,
    },
  ],
  triggered: [
    ward({ mana: "{3}" }),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "create-token", token: "Treasure Token", count: 10, tapped: true },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
