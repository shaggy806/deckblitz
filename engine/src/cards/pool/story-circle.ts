import { defineCard } from "../define.js";

// EDHREC rank 20504.
//
// Circle of Protection with the colour chosen as it entered: the source is
// chosen as the ability resolves (rule 609.7a) among those of the chosen
// colour (`ofChosenColor`), and the shield keeps that colour (608.2h).

const CHOOSE = "As this enchantment enters, choose a color.";
const PREVENT =
  "{W}: The next time a source of your choice of the chosen color would deal damage to you this turn, prevent that damage.";

export default defineCard({
  name: "Story Circle",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CHOOSE}\n${PREVENT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { ofChosenColor: true },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: PREVENT,
    },
  ],
});
