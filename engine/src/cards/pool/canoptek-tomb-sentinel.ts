import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 8062.
//
// "Enters from a graveyard" is the `enteredFrom` filter (Oscorp Industries):
// unearthed, or reanimated by anything else; cast from a hand, it doesn't fire.
const CANNON_TEXT =
  "Exile Cannon — When this creature enters from a graveyard, exile up to one target nonland permanent.";

export default defineCard({
  name: "Canoptek Tomb Sentinel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${CANNON_TEXT}\nUnearth {7} ({7}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [unearth("{7}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { enteredFrom: "graveyard" } },
      targets: [{ kind: "optional", of: "nonland-permanent" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: CANNON_TEXT,
    },
  ],
});
