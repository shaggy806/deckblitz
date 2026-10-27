import { defineCard } from "../define.js";

// EDHREC rank 22778. The enters trigger's counters are divided as it goes on
// the stack (rule 603.3d), at least one each, among up to three other target
// creatures — the group from target slot 1 on, after the artifact or land.
const ETB_TEXT =
  "When Rhino enters, destroy target artifact or land. Distribute three +1/+1 counters among up to three other target creatures. They gain trample until end of turn.";

export default defineCard({
  name: "Rhino, Terrible Trampler",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } },
        { kind: "any-number", of: { kind: "other", of: "creature" }, min: 0, max: 3 },
      ],
      divided: { total: 3, slot: 1, of: "+1/+1 counters" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "counters-divided", from: 1, counter: "+1/+1" },
          {
            kind: "for-each-target",
            from: 1,
            effect: { kind: "grant-keyword", target: 1, keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
