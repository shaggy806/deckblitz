import { defineCard } from "../define.js";

// Portal Three Kingdoms (PTK). EDHREC rank 24351. Soul's Fire's `from`: the
// targeted creature is the damage's source, dealt to its own controller.

const TEXT =
  "When Dong Zhou enters, target creature an opponent controls deals damage equal to its power to that player.";

export default defineCard({
  name: "Dong Zhou, the Tyrant",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "damage",
        amount: { powerOf: 0 },
        toControllerOfTarget: 0,
        from: { target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
