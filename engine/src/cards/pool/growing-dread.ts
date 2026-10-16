import { defineCard } from "../define.js";

// EDHREC rank 11287.
// "Whenever you turn a permanent face up": only the special action turns a
// permanent face up, and only its controller may take it, so the permanents
// you turn face up are exactly the ones you control that are turned face up.
// A face-down instant or sorcery revealed never turns face up (the ruling),
// and the engine never offers it.
const ENTER =
  "When this enchantment enters, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";
const FACE_UP = "Whenever you turn a permanent face up, put a +1/+1 counter on it.";

export default defineCard({
  name: "Growing Dread",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER}\n${FACE_UP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
