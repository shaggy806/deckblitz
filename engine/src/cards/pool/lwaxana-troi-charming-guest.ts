import { defineCard } from "../define.js";

// EDHREC rank 21913.

const UNTAP_TEXT = "You may choose not to untap Lwaxana Troi during your untap step.";
const DOUBLE_TEXT =
  "{2}, {T}: Choose another target creature you control. For as long as Lwaxana Troi remains tapped, if a triggered ability of that creature triggers, that ability triggers an additional time.";

// The creature gets the doubling as a static of its own, for as long as she
// stays tapped (rule 611.2b): it ends as she untaps or leaves.
export default defineCard({
  name: "Lwaxana Troi, Charming Guest",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Betazoid", "Advisor"],
  power: 2,
  toughness: 2,
  text: `${UNTAP_TEXT}\n${DOUBLE_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "grant-static",
        target: 0,
        ability: {
          affects: { scope: "self" },
          doubleTriggersOf: { filter: { isSource: true } },
          text: "If a triggered ability of this creature triggers, that ability triggers an additional time.",
        },
        duration: "while-source-tapped",
      },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
