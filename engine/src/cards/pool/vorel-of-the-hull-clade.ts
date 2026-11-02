import { defineCard } from "../define.js";

const TEXT = "{G}{U}, {T}: Double the number of each kind of counter on target artifact, creature, or land.";

export default defineCard({
  name: "Vorel of the Hull Clade",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Merfolk"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: { kind: "double-counters", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
