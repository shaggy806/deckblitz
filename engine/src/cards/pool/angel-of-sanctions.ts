import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// Amonkhet. Banishing Light's exile-until-it-leaves behind a "you may"; the
// embalmed token copy has the enters trigger too (the ruling).
const ENTERS =
  "When this creature enters, you may exile target nonland permanent an opponent controls until this creature leaves the battlefield.";
const EMBALM_TEXT =
  "Embalm {5}{W} ({5}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Angel with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Angel of Sanctions",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${EMBALM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Exile the target nonland permanent until Angel of Sanctions leaves the battlefield?",
        effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [embalmAbility("{5}{W}", EMBALM_TEXT)],
});
