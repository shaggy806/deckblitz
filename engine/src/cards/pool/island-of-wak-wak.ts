import { defineCard } from "../define.js";

// Arabian Nights. Base power alone (layer 7b, rule 613.4b): a +1/+1 counter
// or a pump still adds on top, and its toughness stays.

const ABILITY = "{T}: Target creature with flying has base power 0 until end of turn.";

export default defineCard({
  name: "Island of Wak-Wak",
  types: ["land"],
  text: ABILITY,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "animate", target: 0, power: 0, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
      resolve: null,
      text: ABILITY,
    },
  ],
});
