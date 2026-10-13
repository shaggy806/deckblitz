import { defineCard } from "../define.js";

// EDHREC rank 361.
//
// Until the cleanup step (rule 514.2) it copies exactly what's printed on the
// card — nothing about the permanent it was before it reached the graveyard;
// an {X} in its cost is 0. It keeps its counters and the effects on it, and
// enters nothing, so no "enters" ability of the card applies (rule 707.4, the
// rulings). It must already control a Forest as it enters to enter untapped.
const TAPPED_TEXT = "This land enters tapped unless you control a Forest.";
const COPY_TEXT =
  "Delirium — {2}{G}{G}: This land becomes a copy of target permanent card in your graveyard until end of turn. Activate only if there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Shifting Woodland",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n{T}: Add {G}.\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
      },
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
      effect: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
      resolve: null,
      text: COPY_TEXT,
      condition: { kind: "delirium" },
    },
  ],
});
