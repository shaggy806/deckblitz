import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// The redirection covers damage to anything (rule 614.9); the same source deals
// it to Opal-Eye, and with Opal-Eye gone it does nothing.

const REDIRECT_TEXT = "{T}: The next time a source of your choice would deal damage this turn, that damage is dealt to Opal-Eye instead.";
const PREVENT_TEXT = "{1}{W}: Prevent the next 1 damage that would be dealt to Opal-Eye this turn.";

export default defineCard({
  name: "Opal-Eye, Konda's Yojimbo",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\nBushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${REDIRECT_TEXT}\n${PREVENT_TEXT}`,
  triggered: [...bushido(1)],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "any", amount: "next-time", redirectTo: "source" },
      resolve: null,
      text: REDIRECT_TEXT,
    },
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: PREVENT_TEXT,
    },
  ],
});
