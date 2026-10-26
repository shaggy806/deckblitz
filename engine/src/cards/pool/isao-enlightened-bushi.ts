import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

export default defineCard({
  name: "Isao, Enlightened Bushi",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 1,
  cantBeCountered: true,
  text: "This spell can't be countered.\nBushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)\n{2}: Regenerate target Samurai.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Samurai" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{2}: Regenerate target Samurai.",
    },
  ],
  triggered: [...bushido(2)],
});
