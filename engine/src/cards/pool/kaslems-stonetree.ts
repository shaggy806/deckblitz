import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

const ENTER_TEXT =
  "When this artifact enters, look at the top six cards of your library. You may put a land card from among them onto the battlefield tapped. Put the rest on the bottom in a random order.";
const CRAFT_TEXT =
  "Craft with Cave {5}{G} ({5}{G}, Exile this artifact, Exile a Cave you control or a Cave card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Kaslem's Stonetree",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  // "A Cave you control or a Cave card from your graveyard" (rule 702.167b).
  activated: [craft("{5}{G}", { count: 1, filter: { subtype: "Cave" }, text: "Cave" }, "Craft with Cave {5}{G}")],
  faces: ["Kaslem's Stonetree", "Kaslem's Strider"],
  transform: true,
});
