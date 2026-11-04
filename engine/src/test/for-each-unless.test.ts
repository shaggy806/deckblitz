/**
 * "For each creature, its controller sacrifices it unless they pay X life"
 * (Killing Wave) — the `for-each-unless` effect: one `unless` question per
 * object, asked of whoever the text names, in turn order (rule 101.4), and what
 * each decline owes happens once everyone has answered (the rulings of Killing
 * Wave and Fade Away). Also the look-and-choose side of the same sentence over
 * a hidden look (Moonlight Bargain).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  graveyard,
  hand,
  lands,
  life,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** Stop at the next choice, returning its question. */
const question = (game: Game) => {
  game.advanceUntil((s) => s.awaiting !== null);
  return game.state.awaiting;
};

/** Answer the `choose-modes` waiting: pay (mode 0) or decline. */
const answer = (game: Game, pay: boolean): void => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") throw new Error(`expected a question, got ${awaiting?.kind}`);
  game.dispatch({ type: "choose-modes", player: awaiting.player, modes: pay ? [0] : [] });
};

const offerOf = (game: Game, player: PlayerId) => {
  const offer = game.legalActions(player).find((la) => la.kind === "choose-modes");
  if (offer?.kind !== "choose-modes") throw new Error("no choose-modes offer");
  return offer;
};

describe("for-each-unless over permanents", () => {
  it("Killing Wave: the active player answers first, then all pay and sacrifice together", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Killing Wave"), { x: 2, settle: false });
    question(game);
    const first = offerOf(game, A);
    expect(first.aboutObject).toBe(mine);
    expect(first.modeTexts[0]).toContain("Grizzly Bears");
    answer(game, true);
    expect(life(game, A)).toBe(18);
    question(game);
    expect(offerOf(game, A).aboutObject).toBe(elves);
    answer(game, false);
    // Nothing goes until the last has answered (the ruling).
    expect(zone(game, elves)).toBe("battlefield");
    question(game);
    expect(offerOf(game, B).aboutObject).toBe(theirs);
    answer(game, false);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("Killing Wave: no question for a creature its controller can't pay for (rule 119.4)", () => {
    const { game } = table({ life: 3 });
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Killing Wave"), { x: 4 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(3);
  });

  it("Killing Wave: what's paid for one leaves less for the next", () => {
    const { game } = table({ life: 5 });
    lands(game, "Swamp", 4);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Killing Wave"), { x: 3, settle: false });
    question(game);
    answer(game, true);
    settle(game);
    // Two life left can't pay 3: the Giant goes unasked.
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("graveyard");
    expect(life(game, A)).toBe(2);
  });

  it("Killing Wave: each token of a stack is asked about (rule 700.3b)", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Raise the Alarm"), {});
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    cast(game, toHand(game, "Killing Wave"), { x: 1, settle: false });
    question(game);
    answer(game, true);
    question(game);
    answer(game, false);
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("Fade Away: a permanent of their choice per decline, each different, all at once", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const forest = spawn(game, "Forest", B);
    const plains = spawn(game, "Plains", B);
    const picks: (readonly ObjectId[])[] = [];
    b.chooseSacrificesFn = (_view, eligible) => {
      picks.push(eligible);
      return [eligible.includes(forest) ? forest : plains];
    };
    cast(game, toHand(game, "Fade Away"), {});
    // Two creatures, two declines (the seat's default), Bob's lands going.
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    // The second question didn't offer what the first had chosen.
    expect(picks[1]).not.toContain(forest);
  });

  it("Fade Away: {1} paid per creature during the resolution spares a sacrifice", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    b.chooseModesFn = (_view, _min, _max, texts) => (texts[0]?.includes("{1}") ? [0] : []);
    cast(game, toHand(game, "Fade Away"), {});
    // The Forest paid and stays, tapped.
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(graveyard(game, B).length).toBe(0);
  });

  it("Cut the Tethers: each Spirit's owner pays {3} or it goes back with the rest", () => {
    const { game, b } = table();
    lands(game, "Island", 4);
    const mine = spawn(game, "Kami of Ancient Law");
    const paid = spawn(game, "Kami of Ancient Law", B);
    const notPaid = spawn(game, "Spectral Bears", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3, B);
    b.chooseModesFn = (_view, _min, _max, texts) => (texts[0]?.includes("Kami") ? [0] : []);
    cast(game, toHand(game, "Cut the Tethers"), {});
    // Bob's {3} spared his Kami; nothing paid for the rest, Alice's mana spent.
    expect(zone(game, paid)).toBe("battlefield");
    expect(zone(game, notPaid)).toBe("hand");
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("for-each-unless over cards", () => {
  it("Moonlight Bargain: the offer states the price", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Moonlight Bargain"), { settle: false });
    question(game);
    const offer = game.legalActions(A).find((la) => la.kind === "choose-from-zone");
    expect(offer?.kind === "choose-from-zone" && offer.prompt).toContain("2 life");
  });

  it("Sirocco: only blue instants, each asked; the rest discarded together", () => {
    const { game, b } = table();
    for (const id of [...hand(game, B)]) game.debugMove(id, "library");
    const counterspell = toHand(game, "Counterspell", B);
    const opt = toHand(game, "Opt", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 2);
    let asked = 0;
    b.chooseModesFn = (_view, _min, _max, texts) => {
      asked += 1;
      return texts[0]?.includes("Counterspell") ? [0] : [];
    };
    const before = game.state.eventLog.length;
    cast(game, toHand(game, "Sirocco"), { targets: [ref(B)] });
    expect(asked).toBe(2);
    expect(life(game, B)).toBe(16);
    expect(zone(game, counterspell)).toBe("hand");
    expect(zone(game, opt)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
    const log = game.state.eventLog.slice(before);
    expect(log.filter((e) => e.type === "cards-revealed" && e.player === B).length).toBe(1);
    expect(log.filter((e) => e.type === "cards-discarded").length).toBe(1);
  });

  it("Sword-Point Diplomacy: you pick the order; an opponent's payment exiles that card, any opponent", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const bottom = toLibrary(game, "Shock");
    const middle = toLibrary(game, "Opt");
    const top = toLibrary(game, "Counterspell");
    const order: string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      order.push(texts.join("|"));
      return [Math.max(0, texts.findIndex((t) => t.includes("Shock")))];
    };
    // Bob pays for nothing, Carol for Counterspell alone.
    b.chooseModesFn = () => [];
    c.chooseModesFn = (_view, _min, _max, texts) => (texts[0]?.includes("Counterspell") ? [0] : []);
    const before = game.state.eventLog.length;
    cast(game, toHand(game, "Sword-Point Diplomacy"), {});
    expect(order.length).toBeGreaterThan(0);
    expect(zone(game, bottom)).toBe("hand");
    expect(zone(game, middle)).toBe("hand");
    expect(zone(game, top)).toBe("exile");
    expect(life(game, C)).toBe(17);
    expect(life(game, B)).toBe(20);
    expect(game.state.eventLog.slice(before).filter((e) => e.type === "cards-revealed").length).toBe(1);
  });

  it("Moonlight Bargain: a private look, 2 life per card kept, the rest in the graveyard", () => {
    const { game, a } = table({ life: 5 });
    lands(game, "Swamp", 5);
    const cards = ["Shock", "Opt", "Counterspell", "Forest", "Plains"].map((name) => toLibrary(game, name));
    let most = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      most = max;
      return [eligible[0], eligible[1]];
    };
    const before = game.state.eventLog.length;
    cast(game, toHand(game, "Moonlight Bargain"), {});
    // Five life pays for two cards, no more (rule 119.4).
    expect(most).toBe(2);
    expect(life(game, A)).toBe(1);
    expect(cards.filter((id) => zone(game, id) === "hand").length).toBe(2);
    expect(cards.filter((id) => zone(game, id) === "graveyard").length).toBe(3);
    expect(game.state.eventLog.slice(before).filter((e) => e.type === "cards-revealed").length).toBe(0);
  });
});
