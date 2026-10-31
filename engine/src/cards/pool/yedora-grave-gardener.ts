import { defineCard } from "../define.js";

const RETURN_TEXT =
  "Whenever another nontoken creature you control dies, you may return it to the battlefield face down under its owner's control. It's a Forest land. (It has no other types or abilities.)";

// The returned card enters face down (rule 708.3) as a Forest land with no
// name, mana cost or other abilities (708.2) — tapping for {G} through
// Forest's intrinsic ability (305.6). Under its owner's control, the
// `put-onto-battlefield` default. It can be turned face up only by its own
// morph or disguise cost (702.37e).

export default defineCard({
  name: "Yedora, Grave Gardener",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 5,
  toughness: 5,
  text: RETURN_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return it to the battlefield face down as a Forest land?",
        effect: { kind: "put-onto-battlefield", target: "trigger-object", faceDown: "Forest land" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
