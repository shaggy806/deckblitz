import { crew, crewText } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 7264. The two triggers are linked (rule 607.2a): the exiled card's
// owner manifests dread as the Vehicle leaves; with nothing exiled, nobody does
// (the ruling), and each owner of an exiled card does if there were several.
const ENTER_TEXT = "When this Vehicle enters, exile up to one target creature with toughness 5 or less.";
const LEAVE_TEXT = "When this Vehicle leaves the battlefield, the exiled card's owner manifests dread.";

export default defineCard({
  name: "Unidentified Hovership",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${LEAVE_TEXT}\nCrew 1`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", toughness: { op: "lte", n: 5 } } } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "owners-of-exiled-with-source",
        effect: { kind: "manifest-dread", who: "that-player" },
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
  activated: [crew(1, crewText(1))],
});
