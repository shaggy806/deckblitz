import { defineCard } from "../define.js";

// Marvel Super Heroes.
//
// "Whenever a player or permanent becomes the target of an ability you control": a
// `becomes-target` trigger watching every permanent (`who: "any"`) and every player
// (`player: "any"`), only an ability (`abilityOnly`) its controller controls (`byControllerOnly`);
// "this ability triggers only once each turn" is `oncePerTurn`.

const TRIGGER_TEXT =
  "Whenever a player or permanent becomes the target of an ability you control, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Loki, God of Mischief",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Sorcerer", "Villain"],
  power: 2,
  toughness: 1,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "any", player: "any", byControllerOnly: true, abilityOnly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: TRIGGER_TEXT,
    },
  ],
});
