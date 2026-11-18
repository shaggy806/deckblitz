import { defineCard } from "../define.js";

// EDHREC rank 14503.
//
// The player's protection (rule 702.16b, c, e): not targeted, enchanted or
// dealt damage by anything of the chosen color, chosen as the trigger
// resolves, until end of turn.

const TRIGGER =
  "When this creature enters, you gain protection from the color of your choice until end of turn. (You can't be targeted, dealt damage, or enchanted by anything of the chosen color.)";

export default defineCard({
  name: "Seht's Tiger",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "grant-protection", players: "you", from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
