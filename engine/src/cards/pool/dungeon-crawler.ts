import { defineCard } from "../define.js";

// EDHREC rank 21325. Its second ability works only from the graveyard (rule
// 113.6k); "this card" is the card only while it's still that object there.
const RETURN_TEXT = "Whenever you complete a dungeon, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Dungeon Crawler",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: `This creature enters tapped.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "completes-dungeon", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dungeon Crawler from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
