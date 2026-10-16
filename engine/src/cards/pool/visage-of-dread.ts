import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

const ENTER_TEXT =
  "When this artifact enters, target opponent reveals their hand. You choose an artifact or creature card from it. That player discards that card.";
const CRAFT_TEXT =
  "Craft with two creatures {5}{B} ({5}{B}, Exile this artifact, Exile the two from among creatures you control and/or creature cards in your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Visage of Dread",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["artifact", "creature"] } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [craft("{5}{B}", { count: 2, filter: { type: "creature" }, text: "two creatures" }, "Craft with two creatures {5}{B}")],
  faces: ["Visage of Dread", "Dread Osseosaur"],
  transform: true,
});
