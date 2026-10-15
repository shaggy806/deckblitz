import { defineCard } from "../define.js";

const SKIN_TEXT =
  "Unbreakable Skin — Whenever Luke Cage attacks alone, he gets +2/+0 and gains indestructible until end of turn.";

export default defineCard({
  name: "Luke Cage, Power Man",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 5,
  text: `${SKIN_TEXT} (Damage and effects that say "destroy" don't destroy him.)`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SKIN_TEXT,
    },
  ],
});
