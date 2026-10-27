import { defineCard } from "../define.js";

// Rulings:
//   [2017-11-17] The second ability of Bladewing's Thrall triggers even if a Dragon enters the
//     battlefield under an opponent's control. The owner of Bladewing's Thrall, not the controller
//     of that Dragon, will control Bladewing's Thrall.

const RETURN_TEXT = "When a Dragon enters, you may return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Bladewing's Thrall",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: `This creature has flying as long as you control a Dragon.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dragon" }, atLeast: 1, countsSelf: true },
      grantKeywords: ["flying"],
      text: "This creature has flying as long as you control a Dragon.",
    },
  ],
  triggered: [
    {
      // From the graveyard, on any player's Dragon (the ruling); the
      // ability's controller is the card's owner, who gets it back.
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "any", filter: { subtype: "Dragon" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Bladewing's Thrall from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
