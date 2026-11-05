import { defineCard } from "../define.js";

const DIES =
  "Whenever a creature or planeswalker you control dies, you may sacrifice this enchantment. If you do, create a 4/4 white Avatar creature token with flying.";
const DISCARDED =
  "When a spell or ability an opponent controls causes you to discard this card, if you control a Plains, create a 4/4 white Avatar creature token with flying.";

export default defineCard({
  name: "Ajani's Last Stand",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${DIES}\n${DISCARDED}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      targets: [],
      // Several deaths at once trigger it as often, but it can be
      // sacrificed only once, so only one token (the ruling).
      effect: {
        kind: "may",
        prompt: "Sacrifice Ajani's Last Stand to create a 4/4 Avatar with flying?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "create-token", token: "Avatar Token (4/4 Flying)", count: 1 },
        },
      },
      resolve: null,
      text: DIES,
    },
    {
      trigger: { on: "this-discarded", byOpponent: true },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Avatar Token (4/4 Flying)", count: 1 },
      resolve: null,
      text: DISCARDED,
    },
  ],
});
