import { defineCard } from "../define.js";

// EDHREC rank 18426.
//
// Steward of the Harvest's grant, on the Forge itself: the target is exiled
// linked to this permanent (rule 607.2a), and the Forge has every activated
// ability of the exiled card that works on the battlefield. An ability naming
// its card means the Forge (the ruling) — `"self"` is the permanent that has
// it. "If you cast it" is an intervening if (Iridescent Tiger's condition).
const ENTERS_TEXT = "When this artifact enters, if you cast it, exile target artifact or land.";
const GRANT_TEXT = "This artifact has all activated abilities of the exiled card.";

export default defineCard({
  name: "Territory Forge",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOfLinkedExile: true,
      text: GRANT_TEXT,
    },
  ],
});
