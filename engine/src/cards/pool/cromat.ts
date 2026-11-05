import { defineCard } from "../define.js";

const DESTROY = "{W}{B}: Destroy target creature blocking or blocked by Cromat.";
const FLY = "{U}{R}: Cromat gains flying until end of turn.";
const REGEN = "{B}{G}: Regenerate Cromat.";
const PUMP = "{R}{W}: Cromat gets +1/+1 until end of turn.";
const TOP = "{G}{U}: Put Cromat on top of its owner's library.";

export default defineCard({
  name: "Cromat",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 5,
  toughness: 5,
  text: [DESTROY, FLY, REGEN, PUMP, TOP].join("\n"),
  activated: [
    {
      cost: { mana: "{W}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "either" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY,
    },
    {
      cost: { mana: "{U}{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: FLY,
    },
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN,
    },
    {
      cost: { mana: "{R}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: "{G}{U}", tap: false },
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: "top" },
      resolve: null,
      text: TOP,
    },
  ],
});
