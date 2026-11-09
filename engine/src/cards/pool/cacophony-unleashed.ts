import { defineCard } from "../define.js";

const WRATH = "When this enchantment enters, if you cast it, destroy all nonenchantment creatures.";
const ANIMATE =
  "Whenever this enchantment or another enchantment you control enters, until end of turn, this enchantment becomes a legendary 6/6 Nightmare God creature with menace and deathtouch. It's still an enchantment.";

export default defineCard({
  name: "Cacophony Unleashed",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${WRATH}\n${ANIMATE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castBy: "you" } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notTypes: ["enchantment"] } },
      resolve: null,
      text: WRATH,
    },
    {
      // "This enchantment or another enchantment you control" — it's one of them.
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        power: 6,
        toughness: 6,
        addTypes: ["creature"],
        addSubtypes: ["Nightmare", "God"],
        addSupertypes: ["legendary"],
        keywords: ["menace", "deathtouch"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
