import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 28038.

const WARD_TEXT =
  "Ward {2} (Whenever this artifact becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)";
const ENTER_TEXT =
  "When this artifact enters, exile target nonland permanent an opponent controls until this artifact leaves the battlefield.";

export default defineCard({
  name: "Malfunctioning Holodeck",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${WARD_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
