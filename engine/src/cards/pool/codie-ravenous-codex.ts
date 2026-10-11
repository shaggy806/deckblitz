import { defineCard } from "../define.js";

// "A prepared spell" is one cast as a prepared permanent's copy of its
// prepare spell (rule 722.3c — the `preparedSpell` filter); the copy of it
// keeps its {X} and choices. "Each creature you control becomes prepared":
// only those with a prepare spell that aren't prepared already do.
const COPY_TEXT = "Whenever you cast a prepared spell, copy it. You may choose new targets for the copy.";
const PREPARE_TEXT =
  "{W}{U}{B}{R}{G}, {T}: Each creature you control becomes prepared. (Only creatures with prepare spells can " +
  "become prepared.)";

export default defineCard({
  name: "Codie, Ravenous Codex",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Book", "Construct"],
  power: 1,
  toughness: 4,
  text: `${COPY_TEXT}\n${PREPARE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { preparedSpell: true } },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: true },
      targets: [],
      effect: { kind: "become-prepared", filter: { type: "creature", controlledBy: "you" } },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
