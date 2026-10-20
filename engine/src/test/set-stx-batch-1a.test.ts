/**
 * Strixhaven: School of Mages, group a — the clause of each card most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  watchTargets,
  zone,
} from "./harness.js";

describe("Rushed Rebirth", () => {
  it("when the chosen creature dies this turn, finds only a creature card of lesser mana value, tapped", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant"); // mana value 4
    const elves = toLibrary(game, "Llanowar Elves"); // 1
    const otherGiant = toLibrary(game, "Hill Giant"); // 4: not lesser
    const offered = pickFromZone(a, elves);
    cast(game, toHand(game, "Rushed Rebirth"), { targets: [ref(giant)] });
    expect(zone(game, elves)).toBe("library");
    destroy(game, giant);
    expect(offered.offered).toContain(elves);
    expect(offered.offered).not.toContain(otherGiant);
    expect(zone(game, elves)).toBe("battlefield");
    expect(game.state.objects[elves].tapped).toBe(true);
  });
});

describe("Plargg, Dean of Chaos", () => {
  it("reveals past a big and a legendary card to a small nonlegendary one, casts it free, and bottoms the rest", () => {
    const { game, a } = table();
    const plargg = spawn(game, "Plargg, Dean of Chaos");
    lands(game, "Mountain", 5);
    const bears = toLibrary(game, "Grizzly Bears");
    const legend = toLibrary(game, "Plargg, Dean of Chaos"); // legendary, mana value 2
    const dragon = toLibrary(game, "Shivan Dragon"); // on top
    a.chooseCastNowFn = (_v, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined ? null : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, free: true };
    };
    activate(game, plargg, 1);
    expect(zone(game, bears)).toBe("battlefield");
    const library = game.state.zones.perPlayer[A].library;
    // The two revealed and not cast are now the bottom two, in either order.
    expect(library.slice(-2).sort()).toEqual([legend, dragon].sort());
  });

  it("a found card not cast goes to the bottom with the rest", () => {
    const { game, a } = table();
    const plargg = spawn(game, "Plargg, Dean of Chaos");
    lands(game, "Mountain", 5);
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseCastNowFn = () => null;
    activate(game, plargg, 1);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bears);
  });
});

describe("Augusta, Dean of Order", () => {
  it("other tapped creatures get +1/+0, other untapped ones +0/+1; attacking untaps them all, then taps the chosen", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    // The back face: cast as face 1 (a spawn is the front face up).
    cast(game, toHand(game, "Plargg, Dean of Chaos"), { face: 1 });
    const [augusta] = named(game, "Plargg, Dean of Chaos", A);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, augusta)).toEqual({ power: 1, toughness: 3 });
    // Bears and Elves attack (tapped); the trigger untaps both, then alice taps the Elves.
    pickPermanents(a, elves);
    attack(game, a, [bears, elves]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[elves].tapped).toBe(true);
    // Still attacked: bob took 2 + 1 (+1 power on the tapped Elves).
    expect(life(game, B)).toBe(20 - 2 - 2);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Torrent Sculptor // Flamethrower Sonata", () => {
  it("Torrent Sculptor exiles a chosen instant or sorcery card and gets half its mana value, rounded up", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    const storm = toGraveyard(game, "Pigment Storm"); // mana value 5
    const seen = pickFromZone(a, storm);
    const sculptor = enter(game, "Torrent Sculptor");
    expect(seen.offered).toEqual([storm]);
    expect(zone(game, storm)).toBe("exile");
    expect(counters(game, sculptor)).toBe(3);
  });

  it("Flamethrower Sonata deals the discarded instant's mana value to a creature an opponent controls", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Shivan Dragon", B);
    const alsoTheirs = spawn(game, "Grizzly Bears", B);
    const research = toHand(game, "Practical Research"); // mana value 5
    a.chooseDiscardsFn = () => [research];
    const seen = watchTargets(a, () => [theirs]);
    cast(game, toHand(game, "Torrent Sculptor"), { face: 1 });
    expect(zone(game, research)).toBe("graveyard");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).toContain(alsoTheirs);
    expect(seen.offered[0]).not.toContain(mine);
    // 5 damage: the 5/5 Dragon dies.
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Flamethrower Sonata discarding a creature card deals no damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Shivan Dragon", B);
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    const seen = watchTargets(a);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Torrent Sculptor"), { face: 1 });
    expect(seen.asked).toBe(0);
    expect(hand(game, A).length).toBe(before - 1 + 1);
  });
});

describe("Divide by Zero", () => {
  it("offers spells and permanents of mana value 1 or more, not lands or tokens", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const land = spawn(game, "Forest", B);
    const giant = spawn(game, "Hill Giant", B);
    const spell = toHand(game, "Divide by Zero");
    const castAt = (target: string) =>
      game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(target as never)] });
    expect(castAt(land)).not.toBeNull();
    expect(castAt(giant)).toBeNull();
    pickModes(a);
    cast(game, spell, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Fortifying Draught", () => {
  it("X counts all life gained this turn, the 2 included", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    cast(game, toHand(game, "Fortifying Draught"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Fractals", () => {
  it("Biomathematician: a counter on each Fractal you control, the new one too", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Leyline Invocation")); // 6 lands → a 6/6
    const [first] = named(game, "Fractal Token", A);
    expect(counters(game, first)).toBe(6);
    enter(game, "Biomathematician");
    const fractals = named(game, "Fractal Token", A);
    expect(fractals.length).toBe(2);
    const second = fractals.find((id) => id !== first)!;
    expect(counters(game, first)).toBe(7);
    expect(counters(game, second)).toBe(1);
  });

  it("Manifestation Sage: X is the cards in your hand as it resolves", () => {
    const { game } = table();
    const inHand = hand(game, A).length;
    enter(game, "Manifestation Sage");
    const [fractal] = named(game, "Fractal Token", A);
    expect(counters(game, fractal)).toBe(inHand);
  });
});

describe("the rest", () => {
  it("Go Blank: discards two, then exiles that player's graveyard, the discards included", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const old = toGraveyard(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Go Blank"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
    expect(zone(game, old)).toBe("exile");
    expect(graveyard(game, B).length).toBe(0);
  });

  it("Pigment Storm: excess damage goes to the creature's controller", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pigment Storm"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Quintorius, Field Historian: Spirits get +1/+0, and a card leaving the graveyard makes a 3/2 Spirit", () => {
    const { game } = table();
    spawn(game, "Quintorius, Field Historian");
    const card = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(card)]);
    settle(game);
    const [spirit] = named(game, "Spirit Token (Red-White)", A);
    expect(pt(game, spirit)).toEqual({ power: 4, toughness: 2 });
  });

  it("Vortex Runner: +1/+0 and can't be blocked only with eight or more lands", () => {
    const { game } = table();
    const runner = spawn(game, "Vortex Runner");
    lands(game, "Island", 7);
    expect(pt(game, runner).power).toBe(2);
    expect(keywords(game, runner).has("unblockable")).toBe(false);
    lands(game, "Island", 1);
    expect(pt(game, runner).power).toBe(3);
    expect(keywords(game, runner).has("unblockable")).toBe(true);
  });

  it("Honor Troll: one more life per gain, and +2/+1 at 25 life", () => {
    const { game } = table({ life: 22 });
    const troll = spawn(game, "Honor Troll");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(life(game, A)).toBe(25);
    expect(pt(game, troll)).toEqual({ power: 4, toughness: 4 });
  });

  it("Reckless Amplimancer doubles its current power and toughness", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const elf = spawn(game, "Reckless Amplimancer");
    activate(game, elf);
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 4 });
  });

  it("Arrogant Poet: paying 2 life gives it flying", () => {
    const { game, a } = table();
    const poet = spawn(game, "Arrogant Poet");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: poet, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(life(game, A)).toBe(18);
    expect(keywords(game, poet).has("flying")).toBe(true);
  });

  it("Quandrix Cultivator: may find a basic Forest or Island, untapped", () => {
    const { game, a } = table();
    const island = toLibrary(game, "Island");
    pickModes(a, 0);
    const seen = pickFromZone(a, island);
    enter(game, "Quandrix Cultivator");
    expect(seen.offered).toEqual([island]);
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(false);
  });

  it("Practical Research: one instant or sorcery card discards in place of two", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game, A).length;
    a.chooseDiscardsFn = () => [bolt];
    cast(game, toHand(game, "Practical Research"));
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 4 - 1);
  });
});
