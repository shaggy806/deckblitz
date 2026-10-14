/**
 * "Whenever [a player] activates an ability" (the `activates-ability`
 * trigger, `who: "you" | "opponent"`): Satoru Umezawa's ninjutsu trigger and
 * the ninjutsu it grants to creature cards in hand (rule 702.49), Harsh
 * Mentor's and Runic Armasaur's "an ability of a [type]" (a permanent's, not
 * a mana ability), and the loyalty-ability triggers (rule 606) of Ajani
 * Unrelenting, Way of the Paradox and Gideon the Oathless. Also Magus Lucea
 * Kane's "when you next cast a spell with {X} in its mana cost or activate an
 * ability with {X} in its activation cost this turn, copy that spell or
 * ability".
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  hand,
  lands,
  life,
  loyalty,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** `attacker` attacks Bob unblocked; the game stops in the declare blockers
 * step with Alice's priority. */
function toBlocks(game: Game, seat: ScriptedController, attacker: ObjectId): void {
  seat.declareAttackersFn = () => [{ attacker, defender: B }];
  toStep(game, "declare-blockers");
}

/** The index of the ninjutsu a card in Alice's hand has from a grant: listed
 * after the card's own abilities. */
const grantedNinjutsu = (game: Game, card: ObjectId): number =>
  game.registry.get(game.state.objects[card].cardName).activated.length;

describe("Satoru Umezawa", () => {
  it("gives a creature card in hand ninjutsu {2}{U}{B}, and its trigger looks at three first", () => {
    const { game, a } = table();
    spawn(game, "Satoru Umezawa");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    const giant = toHand(game, "Hill Giant");
    toBlocks(game, a, bears);
    const before = hand(game).length;
    activate(game, giant, grantedNinjutsu(game, giant), { settle: false });
    // The Bears are back in hand; Satoru's trigger is above the ninjutsu.
    expect(zone(game, bears)).toBe("hand");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].attacking).toBe(B);
    // Bears back (+1), Giant out (-1), one of the top three (+1).
    expect(hand(game).length).toBe(before + 1);
  });

  it("gives ninjutsu to creature cards only, and only while Satoru is there", () => {
    const { game, a } = table();
    const satoru = spawn(game, "Satoru Umezawa");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const giant = toHand(game, "Hill Giant");
    toBlocks(game, a, bears);
    const offered = (card: ObjectId): boolean =>
      game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === card);
    expect(offered(giant)).toBe(true);
    expect(offered(bolt)).toBe(false);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(satoru)] });
    expect(zone(game, satoru)).toBe("graveyard");
    expect(offered(giant)).toBe(false);
  });

  it("triggers only once each turn", () => {
    const { game, a } = table();
    spawn(game, "Satoru Umezawa");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Island", 6);
    lands(game, "Swamp", 2);
    const giant = toHand(game, "Hill Giant");
    const ogre = toHand(game, "Gray Ogre");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: elves, defender: B },
    ];
    toStep(game, "declare-blockers");
    // Each trigger takes one card from the library into the hand.
    const library = (): number => game.state.zones.perPlayer[A].library.length;
    const start = library();
    activate(game, giant, grantedNinjutsu(game, giant));
    expect(library()).toBe(start - 1);
    activate(game, ogre, grantedNinjutsu(game, ogre));
    expect(zone(game, ogre)).toBe("battlefield");
    expect(library()).toBe(start - 1);
  });
});

describe("Magus Lucea Kane", () => {
  it("copies the next spell with {X} in its mana cost, not one without, and only once", () => {
    const { game } = table();
    const magus = spawn(game, "Magus Lucea Kane");
    lands(game, "Mountain", 3);
    activate(game, magus, 0);
    // Lightning Bolt has no {X}: it isn't copied, and the trigger waits.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    // Blaze for 2, paid with the {C}{C}: it and its copy deal 2 each.
    cast(game, toHand(game, "Blaze"), { targets: [ref(B)], x: 2 });
    expect(life(game, B)).toBe(13);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Blaze"), { targets: [ref(B)], x: 2 });
    expect(life(game, B)).toBe(11);
  });

  it("copies the next activated ability with {X} in its activation cost", () => {
    const { game } = table();
    const magus = spawn(game, "Magus Lucea Kane");
    const oracle = spawn(game, "Oracle of Nectars");
    activate(game, magus, 0);
    activate(game, oracle, 0, { x: 2 });
    // The ability and its copy: 2 life each.
    expect(life(game, A)).toBe(24);
  });

  it("lapses at the end of the turn", () => {
    const { game } = table();
    const magus = spawn(game, "Magus Lucea Kane");
    activate(game, magus, 0);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(game.state.delayedTriggers.some((t) => typeof t.at === "object" && "nextSpell" in t.at)).toBe(false);
  });
});

describe("an opponent activating an ability of a permanent", () => {
  it("Harsh Mentor deals 2 damage to that player — not for a mana ability", () => {
    const { game } = table();
    spawn(game, "Harsh Mentor", B);
    const elves = spawn(game, "Llanowar Elves");
    const oracle = spawn(game, "Oracle of Nectars");
    activate(game, elves, 0);
    settle(game);
    expect(life(game, A)).toBe(20);
    activate(game, oracle, 0, { x: 0 });
    expect(life(game, A)).toBe(18);
  });

  it("Harsh Mentor ignores its controller's own abilities", () => {
    const { game } = table();
    spawn(game, "Harsh Mentor", A);
    activate(game, spawn(game, "Oracle of Nectars"), 0, { x: 0 });
    expect(life(game, A)).toBe(20);
  });

  it("Runic Armasaur: its controller may draw for a creature's ability", () => {
    const { game, b } = table();
    spawn(game, "Runic Armasaur", B);
    pickModes(b, 0);
    const before = hand(game, B).length;
    activate(game, spawn(game, "Oracle of Nectars"), 0, { x: 0 });
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("Runic Armasaur ignores an artifact's ability", () => {
    const { game, b } = table();
    spawn(game, "Runic Armasaur", B);
    pickModes(b, 0);
    const before = hand(game, B).length;
    activate(game, spawn(game, "Candelabra of Tawnos"), 0, { x: 0 });
    expect(hand(game, B).length).toBe(before);
  });
});

describe("loyalty abilities", () => {
  it("only a loyalty ability counts", () => {
    const { game } = table();
    spawn(game, "Way of the Paradox");
    spawn(game, "Ajani Unrelenting");
    activate(game, spawn(game, "Oracle of Nectars"), 0, { x: 0 });
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Cadet", A)).toBe(0);
  });

  it("Ajani Unrelenting: the Cadet enters before the +1 resolves, so it gets +1/+0 and haste", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Unrelenting");
    loyalty(game, ajani, 1, { atLeast: 5 });
    expect(tokensNamed(game, "Cadet", A)).toBe(1);
    const cadet = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Cadet")!;
    expect(pt(game, cadet)).toEqual({ power: 3, toughness: 2 });
  });

  it("Gideon the Oathless deals 1 damage to an opponent who activates one, and for each of their creatures entering", () => {
    const { game } = table();
    spawn(game, "Gideon the Oathless", B);
    const ajani = spawn(game, "Ajani Unrelenting");
    loyalty(game, ajani, 1, { atLeast: 5 });
    // 1 for the activation, 1 for the Cadet entering.
    expect(life(game, A)).toBe(18);
  });

  it("Way of the Paradox: 1 life and an extra land drop for each loyalty ability its controller activates", () => {
    const { game } = table();
    spawn(game, "Way of the Paradox");
    const jace = spawn(game, "Jace Beleren");
    loyalty(game, jace, 2, { atLeast: 3 });
    expect(life(game, A)).toBe(21);
    expect(game.state.players[A].extraLandsThisTurn).toBe(1);
  });
});

describe("Rings of Brighthearth", () => {
  it("pays {2} to copy an activated ability, X and all", () => {
    const { game, a } = table();
    spawn(game, "Rings of Brighthearth");
    const oracle = spawn(game, "Oracle of Nectars");
    lands(game, "Wastes", 5);
    pickModes(a, 0);
    activate(game, oracle, 0, { x: 3 });
    // The ability and its copy: 3 life each.
    expect(life(game, A)).toBe(26);
  });

  it("doesn't see a mana ability", () => {
    const { game, a } = table();
    spawn(game, "Rings of Brighthearth");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    activate(game, spawn(game, "Llanowar Elves"), 0);
    settle(game);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});
