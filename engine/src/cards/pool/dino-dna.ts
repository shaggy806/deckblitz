import { defineCard } from "../define.js";

const IMPRINT = "Imprint — {1}, {T}: Exile target creature card from a graveyard. Activate only as a sorcery.";
const COPY =
  "{6}: Create a token that's a copy of target creature card exiled with this artifact, except it's a 6/6 green Dinosaur creature with trample. Activate only as a sorcery.";

export default defineCard({
  name: "Dino DNA",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${IMPRINT}\n${COPY}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: IMPRINT,
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{6}", tap: false },
      targets: [{ kind: "card-in-exile", linked: true, filter: { type: "creature" } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        exceptions: { basePt: [6, 6], setColors: ["G"], setSubtypes: ["Dinosaur"], keywords: ["trample"] },
      },
      resolve: null,
      text: COPY,
      sorcerySpeed: true,
    },
  ],
});
