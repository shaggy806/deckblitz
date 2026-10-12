/**
 * The set walk, batch 62, part a (2026-10-12): Teenage Mutant Ninja Turtles'
 * sneak cards — the clause of each most likely to be wrong, with sneak paid
 * and without where the card reads it.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

type Table = ReturnType<typeof table>;

/** Alice attacks `defender` with `attackers` and stops in the declare
 * blockers step (no blocks), with priority — sneak's window. */
const attackAndHold = (g: Table, attackers: ObjectId[], defender: PlayerId = B): void => {
  g.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender }));
  toStep(g.game, "declare-blockers");
};

/** Cast `card` for its sneak cost, returning `returned`, and settle. */
const sneak = (g: Table, card: ObjectId, returned: ObjectId, targets: ObjectId[] = []): void => {
  g.game.dispatch({ type: "cast-spell", player: A, card, targets: targets.map(ref), via: "sneak", sneakReturn: returned });
  settle(g.game);
};

describe("Shark Shredder, Killer Clone", () => {
  it("puts the hit player's creature card onto the battlefield under your control, attacking them — it deals its damage in the regular step", () => {
    const g = table();
    const { game } = g;
    const shark = spawn(game, "Shark Shredder, Killer Clone");
    const giant = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Grizzly Bears", A);
    const seen = watchTargets(g.a, () => [giant]);
    attack(game, g.a, [shark]);
    // Only bob's graveyard is offered: "that player's".
    expect(seen.offered[0]).toEqual([giant]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(true);
    // 4 first-strike damage, then the Giant's 3 in the regular step.
    expect(life(game, B)).toBe(13);
  });

  it("up to one: choosing none puts nothing onto the battlefield", () => {
    const g = table();
    const { game } = g;
    const shark = spawn(game, "Shark Shredder, Killer Clone");
    const giant = toGraveyard(game, "Hill Giant", B);
    pickTargets(g.a, null);
    attack(game, g.a, [shark]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});

describe("Karai, Future of the Foot", () => {
  it("without sneak, returns the creature card to your hand", () => {
    const g = table();
    const { game } = g;
    const karai = spawn(game, "Karai, Future of the Foot");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(g.a, bears);
    attack(game, g.a, [karai]);
    expect(zone(game, bears)).toBe("hand");
  });

  it("with her sneak cost paid this turn, returns it to the battlefield instead", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const karai = toHand(game, "Karai, Future of the Foot");
    attackAndHold(g, [bears]);
    sneak(g, karai, bears);
    expect(game.state.objects[karai].attacking).toBe(B);
    pickTargets(g.a, giant);
    toStep(game, "postcombat-main");
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });

  it("sneaked in on an earlier turn, the next hit returns to hand", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const karai = toHand(game, "Karai, Future of the Foot");
    attackAndHold(g, [bears]);
    sneak(g, karai, bears);
    // No creature card in the graveyard this turn: the trigger has no target.
    toStep(game, "postcombat-main");
    const giant = toGraveyard(game, "Hill Giant");
    pickTargets(g.a, giant);
    toStep(game, "precombat-main", B);
    attack(game, g.a, [karai]);
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Kitsune's Technique", () => {
  it("target opponent mills half their library, rounded up", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const library = () => game.state.zones.perPlayer[B].library.length;
    // An odd count, so rounding shows.
    game.state.zones.perPlayer[B].library.splice(0, library() % 2 === 0 ? 1 : 0);
    const before = library();
    const mine = game.state.zones.perPlayer[A].library.length;
    cast(game, toHand(game, "Kitsune's Technique"), { targets: [ref(B)] });
    expect(library()).toBe(before - Math.ceil(before / 2));
    expect(game.state.zones.perPlayer[A].library.length).toBe(mine);
  });
});

describe("Leonardo's Technique", () => {
  it("returns two creature cards with mana value 3 or less, never a bigger one", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    // Mana value 3 exactly, and 4.
    const saki = toGraveyard(game, "Oroku Saki, Shredder Rising");
    const giant = toGraveyard(game, "Hill Giant");
    const technique = toHand(game, "Leonardo's Technique");
    const castWith = (ids: ObjectId[]) => ({ type: "cast-spell" as const, player: A, card: technique, targets: ids.map(ref) });
    expect(() => game.dispatch(castWith([bears, giant]))).toThrow();
    expect(() => game.dispatch(castWith([bears, bears]))).toThrow();
    cast(game, technique, { targets: [ref(bears), ref(saki)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, saki)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Leonardo, Big Brother", () => {
  it("gets +1/+0 for each other creature you control, not an opponent's", () => {
    const { game } = table();
    const leo = spawn(game, "Leonardo, Big Brother");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, leo)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Splinter, Hamato Yoshi", () => {
  it("pumps other Ninjas you control, not himself, a non-Ninja or an opponent's Ninja", () => {
    const { game } = table();
    const splinter = spawn(game, "Splinter, Hamato Yoshi");
    const ninja = spawn(game, "Oroku Saki, Shredder Rising");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Oroku Saki, Shredder Rising", B);
    expect(pt(game, splinter)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, ninja)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Shredder, Unrelenting", () => {
  it("sneaked in, only the enters trigger fires: another creature you control gains deathtouch", () => {
    const g = table();
    const { game } = g;
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const third = spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    const shredder = toHand(game, "Shredder, Unrelenting");
    attackAndHold(g, [bears]);
    const seen = watchTargets(g.a, () => [other]);
    sneak(g, shredder, bears);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(other);
    expect(seen.offered[0]).toContain(third);
    expect(seen.offered[0]).not.toContain(shredder);
    expect(seen.offered[0]).toHaveLength(2);
    expect(keywords(game, other).has("deathtouch")).toBe(true);
    expect(keywords(game, third).has("deathtouch")).toBe(false);
  });

  it("attacking, grants deathtouch again", () => {
    const g = table();
    const { game } = g;
    const shredder = spawn(game, "Shredder, Unrelenting");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(g.a, bears);
    g.a.declareAttackersFn = () => [{ attacker: shredder, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });
});

describe("The Last Ronin's Technique", () => {
  it("with sneak paid, the three tokens enter tapped and attacking, and deal their damage", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    attackAndHold(g, [bears]);
    sneak(g, toHand(game, "The Last Ronin's Technique"), bears);
    const tokens = named(game, "Ninja Turtle Spirit Token", A);
    expect(tokensNamed(game, "Ninja Turtle Spirit Token", A)).toBe(3);
    for (const t of tokens) {
      expect(game.state.objects[t].tapped).toBe(true);
      expect(game.state.objects[t].attacking).toBe(B);
    }
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
  });

  it("cast for its mana cost during combat, they just enter", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    attackAndHold(g, [bears]);
    cast(game, toHand(game, "The Last Ronin's Technique"));
    expect(tokensNamed(game, "Ninja Turtle Spirit Token", A)).toBe(3);
    for (const t of named(game, "Ninja Turtle Spirit Token", A)) {
      expect(game.state.objects[t].tapped).toBe(false);
      expect(game.state.objects[t].attacking ?? null).toBe(null);
    }
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
  });
});

describe("Turncoat Kunoichi", () => {
  it("cast for its mana cost, an O-Ring: the creature comes back when Kunoichi leaves", () => {
    const g = table();
    const { game } = g;
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(g.a, giant);
    const kunoichi = enter(game, "Turncoat Kunoichi");
    expect(zone(game, giant)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(kunoichi)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("with sneak paid, the exile is for good", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const kunoichi = toHand(game, "Turncoat Kunoichi");
    attackAndHold(g, [bears]);
    pickTargets(g.a, giant);
    sneak(g, kunoichi, bears);
    expect(zone(game, giant)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(kunoichi)]);
    settle(game);
    expect(zone(game, kunoichi)).toBe("graveyard");
    expect(zone(game, giant)).toBe("exile");
  });
});

describe("Donatello, Gadget Master", () => {
  it("copies target artifact you control, not an opponent's", () => {
    const g = table();
    const { game } = g;
    const don = spawn(game, "Donatello, Gadget Master");
    const ring = spawn(game, "Sol Ring");
    spawn(game, "Mind Stone");
    const theirs = spawn(game, "Sol Ring", B);
    const seen = watchTargets(g.a, () => [ring]);
    attack(game, g.a, [don]);
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(named(game, "Sol Ring", A)).toHaveLength(2);
    expect(named(game, "Sol Ring", A).filter((id) => game.state.objects[id].isToken)).toHaveLength(1);
  });
});

describe("Oroku Saki, Shredder Rising", () => {
  it("you draw a card and lose 1 life on a hit", () => {
    const g = table();
    const { game } = g;
    const saki = spawn(game, "Oroku Saki, Shredder Rising");
    const before = hand(game).length;
    attack(game, g.a, [saki]);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(17);
    expect(graveyard(game)).toHaveLength(0);
  });
});
