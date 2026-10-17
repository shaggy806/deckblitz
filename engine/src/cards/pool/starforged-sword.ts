import { defineCard } from "../define.js";
import { equip, GIFT_KICKER, giftTrigger } from "../helpers.js";

// "Loses flying" applies at the Sword's timestamp, which is when it became
// attached (rule 613.7e): flying the creature had before — printed, or from
// an "as long as" static of its own — is gone; flying granted after it
// isn't (the rulings).

const ENTER_TEXT = "When this Equipment enters, if the gift was promised, attach this Equipment to target creature you control.";
const EQUIPPED_TEXT = "Equipped creature gets +3/+3 and loses flying.";

export default defineCard({
  name: "Starforged Sword",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    "Gift a tapped Fish (You may promise an opponent a gift as you cast this spell. If you do, when it enters, they create a tapped 1/1 blue Fish creature token.)\n" +
    `${ENTER_TEXT}\n${EQUIPPED_TEXT}\nEquip {3}`,
  kicker: GIFT_KICKER,
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], loseKeywords: ["flying"], text: EQUIPPED_TEXT }],
  triggered: [
    giftTrigger("tapped-fish"),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
