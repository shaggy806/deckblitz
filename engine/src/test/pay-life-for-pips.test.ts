import { describe, expect, it } from "vitest";
import { parseManaCost } from "../mana.js";
import { withLifeForPips } from "../mana-payment.js";
import { A, B, cast, counters, hand, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/**
 * "For each {B} in a cost, you may pay 2 life rather than pay that mana"
 * (K'rrik, Son of Yawgmoth): how every mana cost may be paid, the player saying
 * how many as they do for Phyrexian pips (`phyrexianLife`, rule 107.4f), and
 * life paying a pip otherwise only where mana can't.
 */

const offerFor = (game: ReturnType<typeof table>["game"], kind: string, id: string): number | undefined => {
  const offer = game.legalActions(A).find((o) => o.kind === kind && ("card" in o ? o.card === id : "permanent" in o && o.permanent === id));
  return offer !== undefined && "phyrexianPips" in offer ? offer.phyrexianPips : undefined;
};

describe("withLifeForPips", () => {
  it("makes each pip of that colour its colour or life, and only those", () => {
    const cost = withLifeForPips(parseManaCost("{1}{B}{B}{U}"), ["B"]);
    expect(cost.colored.B).toBe(0);
    expect(cost.colored.U).toBe(1);
    expect(cost.generic).toBe(1);
    expect(cost.hybrid).toEqual([
      [{ kind: "color", color: "B" }, { kind: "phyrexian", rather: true }],
      [{ kind: "color", color: "B" }, { kind: "phyrexian", rather: true }],
    ]);
  });

  it("a hybrid pip with the colour in it counts, its Phyrexian half now the same life; others stay", () => {
    const hybrid = (text: string) => withLifeForPips(parseManaCost(text), ["B"]).hybrid[0];
    expect(hybrid("{B/R}")).toContainEqual({ kind: "phyrexian", rather: true });
    expect(hybrid("{2/B}")).toContainEqual({ kind: "phyrexian", rather: true });
    expect(hybrid("{B/P}")).toEqual([{ kind: "color", color: "B" }, { kind: "phyrexian", rather: true }]);
    expect(hybrid("{U/P}")).toEqual([{ kind: "color", color: "U" }, { kind: "phyrexian" }]);
    expect(hybrid("{W/U}")).toEqual(parseManaCost("{W/U}").hybrid[0]);
  });

  it("without the colour, the cost itself", () => {
    const cost = parseManaCost("{1}{B}");
    expect(withLifeForPips(cost, undefined)).toBe(cost);
    expect(withLifeForPips(cost, [])).toBe(cost);
  });
});

describe("K'rrik: paying a cast's {B} with life", () => {
  it("offers each {B} as a choice, and pays those chosen with life, the rest with mana", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const swamps = lands(game, "Swamp", 6);
    const merchant = toHand(game, "Gray Merchant of Asphodel"); // {3}{B}{B}
    expect(offerFor(game, "cast-spell", merchant)).toBe(2);
    cast(game, merchant, { phyrexianLife: 1 });
    expect(life(game, A)).toBeGreaterThanOrEqual(18); // 2 paid, Gray Merchant's drain back.
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(4);
  });

  it("without the choice, mana pays what it can", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const swamps = lands(game, "Swamp", 2);
    const before = life(game, A);
    cast(game, toHand(game, "Vampire Nighthawk"), { settle: false }); // {1}{B}{B}, one short.
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);
    expect(life(game, A)).toBe(before - 2);
  });

  it("mana alone can't pay it: the {B} goes in life, so the spell is on offer", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    lands(game, "Island", 1);
    const nighthawk = toHand(game, "Vampire Nighthawk"); // {1}{B}{B}
    expect(offerFor(game, "cast-spell", nighthawk)).toBe(2);
    cast(game, nighthawk, { settle: false });
    expect(life(game, A)).toBe(16);
  });

  it("never pays generic mana: with no mana for it, not on offer", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const nighthawk = toHand(game, "Vampire Nighthawk"); // {1}{B}{B}
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === nighthawk)).toBe(false);
  });

  it("not another player's costs, nor anyone's once K'rrik has gone", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth", B);
    lands(game, "Swamp", 3);
    const nighthawk = toHand(game, "Vampire Nighthawk");
    expect(offerFor(game, "cast-spell", nighthawk)).toBeUndefined();
  });

  it("a hybrid pip may be paid in life, once it's paid as {B} (the ruling)", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    lands(game, "Mountain", 1);
    const shredder = toHand(game, "Terminate"); // {B}{R}
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, shredder, { targets: [ref(bears)] });
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("life rather than mana pays no Phyrexian symbol: {B/P} under K'rrik doesn't count, {U/P} does (702.150a)", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const dismember = toHand(game, "Dismember"); // {1}{B/P}{B/P}
    cast(game, dismember, { targets: [ref(giant)], phyrexianLife: 2, settle: false });
    expect(life(game, A)).toBe(16);
    expect(game.state.objects[dismember].phyrexianPaidWithLife).toBeUndefined();
    settle(game);

    const { game: second } = table();
    spawn(second, "K'rrik, Son of Yawgmoth");
    const growth = toHand(second, "Mutagenic Growth"); // {G/P}
    cast(second, growth, { targets: [ref(spawn(second, "Grizzly Bears"))], phyrexianLife: 1, settle: false });
    expect(second.state.objects[growth].phyrexianPaidWithLife).toBe(1);
  });

  it("its own cost: {B/P} as ever, before it's there; and a black spell grows it", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const krrik = toHand(game, "K'rrik, Son of Yawgmoth");
    expect(offerFor(game, "cast-spell", krrik)).toBe(3);
    cast(game, krrik, { phyrexianLife: 3 });
    expect(life(game, A)).toBe(14);
    expect(zone(game, krrik)).toBe("battlefield");
    expect(counters(game, krrik)).toBe(0);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Duress"), { targets: [ref(B)], phyrexianLife: 1 });
    expect(life(game, A)).toBe(12);
    expect(counters(game, krrik)).toBe(1);
    // Blue isn't black.
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, krrik)).toBe(1);
  });

  it("gone, and costs are mana again", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const nighthawk = toHand(game, "Vampire Nighthawk");
    expect(offerFor(game, "cast-spell", nighthawk)).toBeUndefined();
  });
});

describe("K'rrik: every other cost that pays {B} (the ruling)", () => {
  it("an activation cost", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const swamp = lands(game, "Swamp", 1)[0];
    const shade = spawn(game, "Nantuko Shade");
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === shade);
    expect(offer?.kind === "activate-ability" && offer.phyrexianPips).toBe(1);
    game.dispatch({ type: "activate-ability", player: A, source: shade, abilityIndex: 0, targets: [], phyrexianLife: 1 });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(game.state.objects[swamp].tapped).toBe(false);
  });

  it("cycling, a special action", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const swamp = lands(game, "Swamp", 1)[0];
    const moor = toHand(game, "Barren Moor");
    expect(offerFor(game, "cycle", moor)).toBe(1);
    const before = hand(game).length;
    game.dispatch({ type: "cycle", player: A, card: moor, phyrexianLife: 1 });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(game.state.objects[swamp].tapped).toBe(false);
    expect(zone(game, moor)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });

  it("cycling without the choice pays mana, with none pays life", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const moor = toHand(game, "Barren Moor");
    game.dispatch({ type: "cycle", player: A, card: moor });
    settle(game);
    expect(life(game, A)).toBe(18);
  });

  it("plotting, another", () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const swamps = lands(game, "Swamp", 3);
    const carnage = toHand(game, "Pitiless Carnage"); // Plot {1}{B}{B}
    expect(offerFor(game, "plot", carnage)).toBe(2);
    game.dispatch({ type: "plot", player: A, card: carnage, phyrexianLife: 2 });
    settle(game);
    expect(life(game, A)).toBe(16);
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
  });

  it('a "you may pay" as it resolves, on the answer', () => {
    const { game } = table();
    spawn(game, "K'rrik, Son of Yawgmoth");
    const swamps = lands(game, "Swamp", 2);
    spawn(game, "Kels, Fight Fixer"); // "you may pay {U/B}. If you do, draw a card"
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: spawn(game, "Viscera Seer"), abilityIndex: 0, targets: [], sacrifice: bears });
    // Stopped at the question, to answer it with the life.
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    const offer = game.legalActions(A).find((o) => o.kind === "choose-modes");
    expect(offer?.kind === "choose-modes" && offer.phyrexianPips).toBe(1);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], phyrexianLife: 1 });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(0);
    expect(hand(game).length).toBe(before + 1);
  });
});
