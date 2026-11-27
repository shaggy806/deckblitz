import { defineCard } from "../define.js";

// EDHREC rank 29929.
//
// A redirection (rule 614.9) to the spell's own controller, as it last
// existed (`"damage-source-controller"`); one of your own spells is dealt to you
// still, as it's going there already.

const CHOOSE = "As this enchantment enters, choose a color.";
const REDIRECT =
  "If an instant or sorcery spell of the chosen color would deal damage to you, it deals that damage to its controller instead.";

export default defineCard({
  name: "Harsh Judgment",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CHOOSE}\n${REDIRECT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        source: { typesAnyOf: ["instant", "sorcery"], ofChosenColor: true },
        instead: { redirect: "damage-source-controller" },
      },
      text: REDIRECT,
    },
  ],
});
