import { defineCard } from "../define.js";

const TEXT =
  "Protection from enemy-colored multicolored (This creature can't be blocked, targeted, dealt damage, enchanted, or equipped by anything that's two enemy colors, such as blue and green.)";

export default defineCard({
  name: "Frenemy of the Guildpact",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      // The rulings: exactly two colors, an enemy pair — white-black, blue-red,
      // black-green, red-white, green-blue; three or more colors isn't.
      affects: { scope: "self" },
      protection: {
        filter: {
          colorCount: 2,
          anyOf: [
            { colors: ["W", "B"] },
            { colors: ["U", "R"] },
            { colors: ["B", "G"] },
            { colors: ["R", "W"] },
            { colors: ["G", "U"] },
          ],
        },
      },
      text: TEXT,
    },
  ],
});
