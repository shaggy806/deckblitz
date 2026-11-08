import { defineCard } from "../define.js";

const LURE = "{G}: Target creature blocks Sisters of Stone Death this turn if able.";
const EXILE = "{B}{G}: Exile target creature blocking or blocked by Sisters of Stone Death.";
const RETURN = "{2}{B}: Put a creature card exiled with Sisters of Stone Death onto the battlefield under your control.";

// The second ability exiles linked to Sisters (rule 607.2a), so the third finds
// any creature card it exiled, whenever (the ruling); a noncreature card exiled
// that way can't be chosen.
export default defineCard({
  name: "Sisters of Stone Death",
  manaCost: "{4}{B}{B}{G}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 7,
  toughness: 5,
  text: `${LURE}\n${EXILE}\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", attacker: "source" }] },
      resolve: null,
      text: LURE,
    },
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "either" } } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE,
    },
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
