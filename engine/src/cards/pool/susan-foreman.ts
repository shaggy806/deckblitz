import { defineCard } from "../define.js";

// The planar-deck replacement never applies: a player may planeswalk only
// during a Planechase game (rule 701.31a), and this engine never plays one.
// It stays in `text`; nothing else is needed for it to do exactly nothing.
const PLANAR_TEXT =
  "If you would planeswalk, instead look at the top two cards of your planar deck, put one on the bottom of your planar deck and the other on top, then planeswalk.";

export default defineCard({
  name: "Susan Foreman",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord"],
  power: 1,
  toughness: 1,
  pairing: { kind: "doctors-companion" },
  text: `${PLANAR_TEXT}\n{T}: Add {G}.\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
});
