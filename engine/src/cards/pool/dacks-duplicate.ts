import { defineCard } from "../define.js";
import { dethrone } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 11396.
//
// Haste and dethrone are copy exceptions — copiable values, so a copy of the
// Duplicate has them too. Copying nothing leaves a 0/0 Shapeshifter (the
// rulings).

export default defineCard({
  name: "Dack's Duplicate",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: "You may have this creature enter as a copy of any creature on the battlefield, except it has haste and dethrone. (Whenever it attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)",
  copyOnEnter: {
    filter: { type: "creature" },
    except: { keywords: ["haste"], triggered: [dethrone()] },
  },
});
