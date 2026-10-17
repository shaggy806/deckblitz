import { defineCard } from "../define.js";
import { distinctTargets, thisOrAnother } from "../helpers.js";

// EDHREC rank 10676.

export default defineCard({
  name: "Quickbeam, Upstart Ent",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 5,
  toughness: 6,
  text: "Whenever Quickbeam or another Treefolk you control enters, up to two target creatures each get +2/+2 and gain trample until end of turn.",
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Treefolk" } },
    targets: distinctTargets(2, "creature", { optional: true }),
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 1, keyword: "trample", duration: "end-of-turn" },
      ],
    },
    resolve: null,
    text: "Whenever Quickbeam or another Treefolk you control enters, up to two target creatures each get +2/+2 and gain trample until end of turn.",
  }),
});
