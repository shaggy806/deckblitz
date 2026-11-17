import { roomCard } from "../helpers.js";
import left from "./smoky-lounge.js";
import right from "./misty-salon.js";

// EDHREC rank 11616. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Smoky Lounge // Misty Salon", left, right);
