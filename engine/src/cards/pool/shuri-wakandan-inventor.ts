import { defineCard } from "../define.js";

// EDHREC rank 5836.
//
// The reduction takes only generic mana. The first target copies the
// second's copiable values — what that is copying, if anything — except it
// isn't legendary, a copiable value too (rule 707.9b), until the cleanup step
// (rule 514.2); its own counters, status and other effects stay (rule 707.4).
const COST_TEXT = "Artifact spells you cast cost {1} less to cast.";
const COPY_TEXT =
  "{1}, {T}: Target artifact you control becomes a copy of a second target artifact you control until end of turn, except it isn't legendary. Activate only as a sorcery.";

export default defineCard({
  name: "Shuri, Wakandan Inventor",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Hero"],
  power: 2,
  toughness: 1,
  text: `${COST_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "artifact", controlledBy: "you" }, reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        { kind: "permanent", whose: "you", filter: { type: "artifact" } },
        { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } }, than: { slots: [0] } },
      ],
      effect: {
        kind: "become-copy",
        target: 0,
        of: 1,
        until: "end-of-turn",
        exceptions: { notLegendary: true },
      },
      resolve: null,
      text: COPY_TEXT,
      sorcerySpeed: true,
    },
  ],
});
